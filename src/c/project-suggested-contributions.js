/**
 * window.c.ProjectSuggestedContributions component
 * A Project-show page helper to show suggested amounts of contributions
 *
 * Example of use:
 * view: () => {
 *   ...
 *   m.component(c.ProjectSuggestedContributions, {project: project})
 *   ...
 * }
 */
import m from 'mithril';
import _ from 'underscore';

const projectSuggestedContributions = {
    view(ctrl, args) {
        const project = args.project();

        const suggestionUrl = amount => `/projects/${project.project_id}/contributions/new?amount=${amount}`,
            suggestedValues = [100, 500, 1000, 2000];
        return m('');
        // return m('#suggestions', _.map(suggestedValues, amount => project ? m(`a[href="${suggestionUrl(amount)}"].card-reward.card-big.card-secondary.u-marginbottom-20`, [
        //     m('.fontsize-larger', `Php ${amount}`)
        // ]) : ''));
    }
};

export default projectSuggestedContributions;
