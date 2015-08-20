window.c.AdminProjectDetailsCard = (function(m, h){
  return {
    controller: function(args) {
      var project = args.resource,
          generateStatusText = function() {
            var statusTextObj = m.prop({});
            switch (project.state) {
              case 'online':
                statusTextObj({cssClass: 'text-success', text: 'NO AR'});
                break;
              case 'successful':
                statusTextObj({cssClass: 'text-success', text: 'FINANCIADO'});
                break;
              case 'failed':
                statusTextObj({cssClass: 'text-error', text: 'NÃO FINANCIADO'});
                break;
              case 'waiting_funds':
                statusTextObj({cssClass: 'text-waiting', text: 'AGUARDANDO'});
                break;
              case 'rejected':
                statusTextObj({cssClass: 'text-error', text: 'RECUSADO'});
                break;
              case 'draft':
                statusTextObj({cssClass: '', text: 'RASCUNHO'});
                break;
              case 'in_analysis':
                statusTextObj({cssClass: '', text: 'EM ANÁLISE'});
                break;
              case 'approved':
                statusTextObj({cssClass: 'text-success', text: 'APROVADO'});
                break;
            }
            return statusTextObj;
          },
          generateRemaingTime = function() {
            var remainingTextObj = m.prop({}),
                translatedTime = {
                  days: 'dias',
                  minutes: 'minutos',
                  hours: 'horas',
                  seconds: 'segundos'
                };

            remainingTextObj({
              unit: translatedTime[project.remaining_time.unit || 'seconds'],
              total: project.remaining_time.total
            });

            return remainingTextObj;
          };

      return {
        project: project,
        statusTextObj: generateStatusText(),
        remainingTextObj: generateRemaingTime()
      };
    },

    view: function(ctrl) {
      var project = ctrl.project,
          progress = project.progress.toFixed(2),
          statusTextObj = ctrl.statusTextObj(),
          remainingTextObj = ctrl.remainingTextObj();

      return m('.card.u-radius.card-terciary.u-marginbottom-20', [
        m('div', [
          m('.fontsize-small.fontweight-semibold', [
            m('span.fontcolor-secondary', 'Status:'),' ',m('span', {class: statusTextObj.cssClass}, statusTextObj.text),' '
          ]),
          (function(){
            if (project.is_published) {
              return [
                m('.meter.u-margintop-20.u-marginbottom-10', [
                  m('.meter-fill', {style: {width: (progress > 100 ? 100 : progress) + '%'}})
                ]),
                m('.w-row', [
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', progress + '%'),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'financiado')
                  ]),
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', [
                      'R$ ' + h.formatNumber(project.pledged, 2),
                    ]),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small.u-marginbottom-10', 'levantados')
                  ]),
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', project.total_contributions),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small', 'apoios')
                  ]),
                  m('.w-col.w-col-3.w-col-small-3.w-col-tiny-6', [
                    m('.fontweight-semibold.fontsize-large.lineheight-tight', remainingTextObj.total),
                    m('.fontcolor-secondary.lineheight-tighter.fontsize-small', remainingTextObj.unit + ' restantes')
                  ])
                ])
              ];
            }
          }())
        ])
      ]);
    }
  };
}(window.m, window.c.h));

