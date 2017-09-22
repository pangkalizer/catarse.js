import m from 'mithril';
import moment from 'moment';
import _ from 'underscore';
import h from '../h';
import shippingFeeInput from '../c/shipping-fee-input';
import rewardVM from '../vms/reward-vm';

const editRewardCard = {
    controller(args) {
        const reward = args.reward(),
            fields = {
                title: m.prop(reward.title),
                shipping_options: m.prop(reward.shipping_options),
                minimumValue: m.prop(reward.minimum_value),
                description: m.prop(reward.description),
                deliverAt: m.prop(reward.deliver_at)
            },
            destroyed = m.prop(false),
            acceptNumeric = (e) => {
                fields.minimumValue(e.target.value.replace(/[^0-9]/g, ''));
                return true;
            },
            confirmDelete = () => {
                const r = confirm('Are you sure?');
                if (r) {
                    return m.request({
                        method: 'DELETE',
                        url: `/projects/${args.project_id}/rewards/${reward.id}`,
                        config: h.setCsrfToken
                    }).then(() => {
                        destroyed(true);
                        m.redraw();
                    });
                }
                return false;
            },
            descriptionError = m.prop(false),
            minimumValueError = m.prop(false),
            deliverAtError = m.prop(false),
            index = args.index,
            showTips = h.toggleProp(false, true),
            states = m.prop([]),
            fees = m.prop([]),
            statesLoader = rewardVM.statesLoader,
            updateOptions = () => {
                if (((fields.shipping_options() === 'national' || fields.shipping_options() === 'international') && !_.contains(_.pluck(fees(), 'destination'), 'others'))) {
                    fees().push({
                        value: 0,
                        destination: 'others'
                    });
                }
                if (fields.shipping_options() === 'national') {
                    fees(_.reject(fees(), fee => fee.destination === 'international'));
                } else if (fields.shipping_options() === 'international' && !_.contains(_.pluck(fees(), 'destination'), 'international')) {
                    fees().push({
                        value: 0,
                        destination: 'international'
                    });
                }
            };

        statesLoader.load().then((data) => {
            states(data);
            states().unshift({
                acronym: null,
                name: 'state'
            });

            if (!reward.newReward) {
                rewardVM.getFees(reward).then((feeData) => {
                    fees(feeData);
                    updateOptions();
                });
            }
        });

        _.extend(args.reward(), {
            validate: () => {
                descriptionError(false);
                minimumValueError(false);
                deliverAtError(false);
                if (reward.newReward && moment(fields.deliverAt()).isBefore(moment().date(-1))) {
                    args.error(true);
                    deliverAtError(true);
                }
                if (_.isEmpty(fields.description())) {
                    args.error(true);
                    descriptionError(true);
                }
                if (!fields.minimumValue() || parseInt(fields.minimumValue()) < 10) {
                    args.error(true);
                    minimumValueError(true);
                }
                _.map(fees(), (fee) => {
                    _.extend(fee, { error: false });
                    if (fee.destination === null) {
                        args.error(true);
                        _.extend(fee, { error: true });
                    }
                });
            }
        });

        return {
            fields,
            minimumValueError,
            deliverAtError,
            descriptionError,
            confirmDelete,
            acceptNumeric,
            updateOptions,
            showTips,
            destroyed,
            states,
            reward,
            index,
            fees
        };
    },
    view(ctrl, args) {
        const index = ctrl.index,
            newFee = {
                value: null,
                destination: null
            },
            fees = ctrl.fees(),
            reward = args.reward(),
            inlineError = message => m('.fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle',
                m('span',
                    message
                )
            );

        return ctrl.destroyed() ? m('div', '') : m('.w-row.card.card-terciary.u-marginbottom-20.card-edition.medium', [
            m('.card',
                m('.w-form', [
                    m('.w-row', [
                        m('.w-col.w-col-5',
                            m('label.fontsize-smaller',
                                'Title:'
                            )
                        ),
                        m('.w-col.w-col-7',
                            m(`input.w-input.text-field.positive[aria-required='true'][autocomplete='off'][type='tel'][id='project_rewards_attributes_${index}_title']`, {
                                name: `project[rewards_attributes][${index}][title]`,
                                value: ctrl.fields.title(),
                                onchange: m.withAttr('value', ctrl.fields.title)
                            })
                        )
                    ]),
                    m('.w-row.u-marginbottom-20', [
                        m('.w-col.w-col-5',
                            m('label.fontsize-smaller',
                                'Minimum value:'
                            )
                        ),
                        m('.w-col.w-col-7', [
                            m('.w-row', [
                                m('.w-col.w-col-3.w-col-small-3.w-col-tiny-3.text-field.positive.prefix.no-hover',
                                    m('.fontsize-smallest.fontcolor-secondary.u-text-center',
                                        'Php'
                                    )
                                ),
                                m('.w-col.w-col-9.w-col-small-9.w-col-tiny-9',
                                    m(`input.string.tel.required.w-input.text-field.project-edit-reward.positive.postfix[aria-required='true'][autocomplete='off'][required='required'][type='tel'][id='project_rewards_attributes_${index}_minimum_value']`, {
                                        name: `project[rewards_attributes][${index}][minimum_value]`,

                                        class: ctrl.minimumValueError() ? 'error' : false,
                                        value: ctrl.fields.minimumValue(),
                                        oninput: e => ctrl.acceptNumeric(e)
                                    })
                                )
                            ]),
                            ctrl.minimumValueError() ? inlineError('Amount must be equal to or greater than Php 10.') : '',

                            m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_minimum_value']",
                                'Enter a minimum value greater than or equal to 10'
                            )
                        ])
                    ]),
                    m('.w-row', [
                        m('.w-col.w-col-5',
                            m('label.fontsize-smaller',

                                'Delivery forecast:'
                            )
                        ),
                        m('.w-col.w-col-7',
                            m('.w-row',
                                m('.w-col.w-col-12',
                                    m('.w-row', [
                                        m(`input[id='project_rewards_attributes_${index}_deliver_at_3i'][type='hidden'][value='1']`, {
                                            name: `project[rewards_attributes][${index}][deliver_at(3i)]`
                                        }),
                                        m(`select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_${index}_deliver_at_2i']`, {
                                            name: `project[rewards_attributes][${index}][deliver_at(2i)]`,
                                            class: ctrl.deliverAtError() ? 'error' : false,
                                            onchange: (e) => {
                                                ctrl.fields.deliverAt(moment(ctrl.fields.deliverAt()).month(parseInt(e.target.value) - 1).format());
                                            }
                                        }, [
                                            _.map(moment.monthsShort(), (month, monthIndex) => m(`option[value='${monthIndex + 1}']`, {
                                                selected: moment(ctrl.fields.deliverAt()).format('M') == monthIndex + 1
                                            },
                                                h.capitalize(month)
                                            ))
                                        ]),
                                        m(`select.date.required.w-input.text-field.w-col-6.positive[aria-required='true'][discard_day='true'][required='required'][use_short_month='true'][id='project_rewards_attributes_${index}_deliver_at_1i']`, {
                                            name: `project[rewards_attributes][${index}][deliver_at(1i)]`,
                                            class: ctrl.deliverAtError() ? 'error' : false,
                                            onchange: (e) => {
                                                ctrl.fields.deliverAt(moment(reward.deliverAt).year(parseInt(e.target.value)).format());
                                            }
                                        }, [
                                            _.map(_.range(moment().year(), moment().year() + 6), year =>
                                                m(`option[value='${year}']`, {
                                                    selected: moment(ctrl.fields.deliverAt()).format('YYYY') === String(year)
                                                },
                                                    year
                                                )
                                            )
                                        ])
                                    ])
                                )
                            ),
                            ctrl.deliverAtError() ? inlineError('Delivery date can not be in the past.') : '',
                        )
                    ]),
                    m('.w-row',
                        m('label.fontsize-smaller',
                            'Description:'
                        )
                    ),
                    m('.w-row', [
                        m(`textarea.text.required.w-input.text-field.positive.height-medium[aria-required='true'][placeholder='Describe your reward'][required='required'][id='project_rewards_attributes_${index}_description']`, {
                            name: `project[rewards_attributes][${index}][description]`,
                            value: ctrl.fields.description(),
                            class: ctrl.descriptionError() ? 'error' : false,
                            onchange: m.withAttr('value', ctrl.fields.description)
                        }),
                        m(".fontsize-smaller.text-error.u-marginbottom-20.fa.fa-exclamation-triangle.w-hidden[data-error-for='reward_description']",
                            'Description can not be empty'
                        )
                    ]),
                    ctrl.descriptionError() ? inlineError('Description can not be empty.') : '', ,
                    // m('.u-marginbottom-30.w-row', [
                    //     m('.w-col.w-col-3',
                    //         m("label.fontsize-smaller[for='field-2']",
                    //             'Tipo de entrega'
                    //         )
                    //     ),
                    //     m('.w-col.w-col-9', [
                    //         m(`select.positive.text-field.w-select[id='project_rewards_attributes_${index}_shipping_options']`, {
                    //             name: `project[rewards_attributes][${index}][shipping_options]`,
                    //             value: ctrl.fields.shipping_options() || 'free',
                    //             onchange: (e) => {
                    //                 ctrl.fields.shipping_options(e.target.value);
                    //                 ctrl.updateOptions();
                    //             }
                    //         }, [
                    //             m('option[value=\'international\']',
                    //                 'Frete Nacional e Internacional'
                    //             ),
                    //             m('option[value=\'national\']',
                    //                 'Frete Nacional'
                    //             ),
                    //             m('option[value=\'free\']',
                    //                 'Sem frete envolvido'
                    //             ),
                    //             m('option[value=\'presential\']',
                    //                 'Retirada presencial'
                    //             )
                    //         ]),
                    //
                    //         ((ctrl.fields.shipping_options() === 'national' || ctrl.fields.shipping_options() === 'international') ?
                    //             m('.card.card-terciary', [
                    //
                    //                 // state fees
                    //                 (_.map(fees, (fee, feeIndex) => [m(shippingFeeInput, {
                    //                     fee,
                    //                     fees: ctrl.fees,
                    //                     index,
                    //                     feeIndex,
                    //                     states: ctrl.states
                    //                 }),
                    //
                    //                 ])),
                    //                 m('.u-margintop-20',
                    //                     m("a.alt-link[href='#']", {
                    //                         onclick: () => {
                    //                             ctrl.fees().push(newFee);
                    //                             return false;
                    //                         }
                    //
                    //                     },
                    //                         'Adicionar destino'
                    //                     )
                    //                 )
                    //             ]) : '')
                    //     ])
                    // ]),
                    m('.Limit must be greater than amount of supportsw-row.u-margintop-30', [
                        (reward.newReward ? '' :
                            m('.w-col.w-col-5.w-col-small-5.w-col-tiny-5.w-sub-col-middle',
                                m("input.w-button.btn-terciary.btn.btn-small.reward-close-button[type='submit'][value='Close']", {
                                    onclick: () => {
                                        reward.edit.toggle();
                                    }
                                })
                            )),
                        m('.w-col.w-col-1.w-col-small-1.w-col-tiny-1', [
                            m(`input[id='project_rewards_attributes_${index}__destroy'][type='hidden'][value='false']`, {
                                name: `project[rewards_attributes][${index}][_destroy]`
                            }),
                            m('a.remove_fields.existing', { onclick: ctrl.confirmDelete },
                                m('.btn.btn-small.btn-terciary.fa.fa-lg.fa-trash.btn-no-border')
                            )
                        ])
                    ])
                ])
            )
        ]);
    }
};

export default editRewardCard;
