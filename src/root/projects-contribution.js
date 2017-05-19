import m from 'mithril';
import _ from 'underscore';
import rewardVM from '../vms/reward-vm';
import paymentVM from '../vms/payment-vm';
import projectVM from '../vms/project-vm';
import projectHeaderTitle from '../c/project-header-title';
import rewardSelectCard from '../c/reward-select-card';
import h from '../h';
import faqBox from '../c/faq-box';


const projectsContribution = {
    controller() {
        const rewards = () => _.union(
            [{
                id: null,
                description: 'Thank you. I just want to help the project.',
                minimum_value: 100,
                shipping_options: null,
                row_order: -9999999
            }],
            projectVM.rewardDetails()
        );

        const submitContribution = () => {
            const valueFloat = h.monetaryToFloat(rewardVM.contributionValue);

            if (valueFloat < rewardVM.selectedReward().minimum_value) {
                rewardVM.error(`The support amount for this reward must be at least Rs${rewardVM.selectedReward().minimum_value}`);
            } else {
                rewardVM.error('');
                h.navigateTo(`/projects/${projectVM.currentProject().project_id}/contributions/fallback_create?contribution%5Breward_id%5D=${rewardVM.selectedReward().id}&contribution%5Bvalue%5D=${valueFloat}`);
            }

            return false;
        };

        projectVM.getCurrentProject();

        return {
            paymentVM: paymentVM(projectVM.currentProject().mode),
            project: projectVM.currentProject,
            submitContribution,
            sortedRewards: () => _.sortBy(rewards(), reward => Number(reward.row_order))
        };
    },
    view(ctrl) {
        const project = ctrl.project;

        return m('#contribution-new',
            project && !_.isUndefined(project()) ? [
                m(`.w-section.section-product.${project().mode}`),
                m(projectHeaderTitle, {
                    project
                }),
                m('.w-section.header-cont-new',
                    m('.w-container',
                        m('.fontweight-semibold.lineheight-tight.text-success.fontsize-large.u-text-center-small-only',
                            'Choose the reward and then the value of the support'
                        )
                    )
                ),
                m('.section', m('.w-container', m('.w-row', [
                    m('.w-col.w-col-8',
                        m('.w-form.back-reward-form',
                            m(`form.simple_form.new_contribution[accept-charset="UTF-8"][action="/en/projects/${project().id}/contributions/fallback_create"][id="contribution_form"][method="get"][novalidate="novalidate"]`,
                                { onsubmit: ctrl.submitContribution }
                            , [
                                m('input[name="utf8"][type="hidden"][value="✓"]'),
                                _.map(ctrl.sortedRewards(), reward => m(rewardSelectCard, { reward }))
                            ])
                        )
                    ),
                    m('.w-col.w-col-4', m.component(faqBox, {
                        mode: project().mode,
                        vm: ctrl.paymentVM,
                        faq: ctrl.paymentVM.faq(),
                        projectUserId: project().user.id
                    }))
                ])))
            ] : '');
    }
};

export default projectsContribution;
