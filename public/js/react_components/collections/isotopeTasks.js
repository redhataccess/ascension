(function() {
  var AjaxMixin, Component, Isotope, React, Router, TaskIconMapping, TaskStateEnum, TaskTypeEnum, br, button, cx, d3, div, h1, h2, i, img, jQuery, li, nbsp, p, span, ul, _, _ref;

  React = require('react');

  Router = require('react-router/dist/react-router');

  jQuery = require('jquery');

  Isotope = require('isotope/js/isotope');

  AjaxMixin = require('../mixins/ajaxMixin.coffee');

  cx = React.addons.classSet;

  d3 = require('d3/d3');

  _ = require('lodash');

  TaskIconMapping = require('../utils/taskIconMapping.coffee');

  TaskTypeEnum = require('../../../../src/com/redhat/ascension/rules/enums/TaskTypeEnum.coffee');

  TaskStateEnum = require('../../../../src/com/redhat/ascension/rules/enums/TaskStateEnum.coffee');

  _ref = React.DOM, div = _ref.div, button = _ref.button, img = _ref.img, h1 = _ref.h1, h2 = _ref.h2, ul = _ref.ul, li = _ref.li, span = _ref.span, br = _ref.br, p = _ref.p, i = _ref.i;

  nbsp = "\u00A0";

  Component = React.createClass({
    displayName: 'Tasks',
    mixins: [AjaxMixin],
    getInitialState: function() {
      return {
        'loading': false,
        'tasks': [],
        'minScore': 0,
        'maxScore': 0,
        'layoutMode': this.props.layoutMode || 'masonry',
        'sortBy': this.props.sortBy || 'score'
      };
    },
    genTaskClass: function(t) {
      var classSet;
      classSet = {
        'task': true,
        'task100': true,
        'case': t['type'] === 'case',
        'kcs': t['type'] === 'kcs'
      };
      return cx(classSet);
    },
    genTaskStyle: function(t) {
      var theStyle;
      return theStyle = {
        opacity: this.scoreOpacityScale(t.score)
      };
    },
    taskClick: function(t) {
      event.preventDefault();
      return Router.transitionTo("/task/" + t['_id']);
    },
    genTaskIconClass: function(t) {
      var tmp, _ref1;
      tmp = void 0;
      if (t['type'] === TaskTypeEnum.CASE.name) {
        tmp = ((_ref1 = TaskIconMapping[t['case']['Internal_Status__c']]) != null ? _ref1.icon : void 0) || tmp;
      }
      return tmp || 'fa-medkit';
    },
    genTaskName: function(t) {
      return t['bid'];
    },
    genTaskSymbol: function(t) {
      var sym;
      sym = void 0;
      if (t['type'] === TaskTypeEnum.CASE.name) {
        sym = "C";
      }
      return sym || 'T';
    },
    genTaskStateIcon: function(t) {
      var _ref1;
      return ((_ref1 = TaskIconMapping[t['state']]) != null ? _ref1.icon : void 0) || 'fa-medkit';
    },
    genTaskElements: function() {
      var tasks;
      tasks = _.map(this.state['tasks'], (function(_this) {
        return function(t) {
          return div({
            id: t['_id'],
            className: _this.genTaskClass(t),
            style: _this.genTaskStyle(t),
            key: t['_id'],
            onClick: _this.taskClick.bind(_this, t)
          }, [
            i({
              className: "task-state fa " + (_this.genTaskStateIcon(t))
            }, []), p({
              className: "task-symbol"
            }, [_this.genTaskSymbol(t)]), span({
              className: "task-icon"
            }, [
              i({
                className: "fa " + (_this.genTaskIconClass(t))
              }, []), nbsp, span({}, [_this.genTaskName(t)])
            ])
          ]);
        };
      })(this));
      return tasks;
    },
    changeLayout: function(layoutMode) {
      event.preventDefault();
      return this.iso.arrange({
        layoutMode: layoutMode
      });
    },
    changeSort: function(sortByName) {
      event.preventDefault();
      return this.iso.arrange({
        sortBy: sortByName
      });
    },
    filterBySbr: function(sbr) {
      var self;
      self = this;
      event.preventDefault();
      return this.iso.arrange({
        filter: function(itemElem) {
          var task, _id;
          _id = $(itemElem).attr('id');
          task = self.state['tasks'][_id];
          return _.contains(task['sbrs'], sbr);
        }
      });
    },
    clearFilter: function() {
      event.preventDefault();
      return this.iso.arrange({
        filter: function(itemElem) {
          return true;
        }
      });
    },
    genBtnGroupClass: function(opts) {
      var classSet;
      classSet = {
        'btn': true,
        'btn-default': true,
        'active': this.state[opts['stateVarName']] === opts['var']
      };
      return cx(classSet);
    },
    genBtnGroupLayout: function() {
      var layoutModes;
      layoutModes = ['masonry', 'vertical'];
      return _.map(layoutModes, (function(_this) {
        return function(layoutMode) {
          return button({
            key: layoutMode,
            type: 'button',
            className: _this.genBtnGroupClass({
              stateVarName: 'layoutMode',
              'var': layoutMode
            }),
            onClick: _this.changeLayout.bind(_this, layoutMode)
          }, [layoutMode]);
        };
      })(this));
    },
    genBtnGroupSort: function() {
      var sortBys;
      sortBys = ['score', 'sbt'];
      return _.map(sortBys, (function(_this) {
        return function(sortBy) {
          return button({
            key: sortBy,
            type: 'button',
            className: _this.genBtnGroupClass({
              stateVarBy: 'sortBy',
              'var': sortBy
            }),
            onClick: _this.changeSort.bind(_this, sortBy)
          }, [sortBy]);
        };
      })(this));
    },
    genBtnGroupSbrFilter: function(sbrs) {
      var btns;
      btns = _.map(sbrs, (function(_this) {
        return function(sbr) {
          return button({
            key: sbr,
            type: 'button',
            className: _this.genBtnGroupClass({
              stateVarBy: 'sbr',
              'var': sbr
            }),
            onClick: _this.filterBySbr.bind(_this, sbr)
          }, [sbr]);
        };
      })(this));
      btns.unshift(button({
        key: 'Show All',
        type: 'button',
        className: this.genBtnGroupClass({
          stateVarBy: 'sbr',
          'var': 'Show All'
        }),
        onClick: this.clearFilter.bind(this)
      }, ['Show All']));
      return btns;
    },
    opacify: function() {
      return $('.task').each((function(_this) {
        return function(idx, itemElem) {
          var task, _id;
          _id = $(itemElem).attr('id');
          task = _this.state['tasks'][_id];
          return $(itemElem).css({
            'opacity': _this.scoreOpacityScale(task['score']),
            '-webkit-transition': 'opacity 0.5s ease-in-out',
            '-moz-transition': 'opacity 0.5s ease-in-out',
            '-o-transition': 'opacity 0.5s ease-in-out',
            'transition': 'opacity 0.5s ease-in-out'
          });
        };
      })(this));
    },
    setScoreScale: function(min, max) {
      this.scoreScale = d3.scale.quantize().domain([min, max]).range([100, 200, 300]);
      return this.scoreOpacityScale = d3.scale.linear().domain([min, max]).range([.25, 1]);
    },
    idSelector: function() {
      return '#' + this.props.id;
    },
    createIsotopeContainer: function() {
      var self;
      self = this;
      if (this.iso == null) {
        this.iso = new Isotope(this.refs['tasksContainer'].getDOMNode(), {
          itemSelector: '.task',
          layoutMode: 'masonry',
          masonry: {
            rowHeight: 100
          },
          sortBy: 'score',
          sortAscending: {
            score: false
          },
          getSortData: {
            score: function(itemElem) {
              var task, _id;
              _id = $(itemElem).attr('id');
              task = self.state['tasks'][_id];
              return task['score'];
            },
            bid: function(itemElem) {
              var task, _id;
              _id = $(itemElem).attr('id');
              task = self.state['tasks'][_id];
              return task['bid'];
            },
            sbt: function(itemElem) {
              var task, _id;
              _id = $(itemElem).attr('id');
              task = self.state['tasks'][_id];
              return task['case']['SBT__c'];
            }
          }
        });
        return this.iso.on('layoutComplete', (function(_this) {
          return function() {
            return _this.opacify();
          };
        })(this));
      }
    },
    componentDidMount: function() {
      var self;
      self = this;
      this.createIsotopeContainer();
      return this.get({
        path: '/tasks'
      }).then((function(_this) {
        return function(tasks) {
          var max, min, _ref1, _ref2;
          _this.tasksById = _.object(_.map(tasks, function(t) {
            return [t['_id'], t];
          }));
          min = _.chain(tasks).pluck('score').min().value();
          max = _.chain(tasks).pluck('score').max().value();
          _this.setScoreScale(min, max);
          _this.setState({
            'tasks': _.object(_.map(tasks, function(t) {
              return [t['_id'], t];
            })),
            'minScore': min,
            'maxScore': max
          });
          if ((_ref1 = _this.iso) != null) {
            _ref1.reloadItems();
          }
          _this.iso.layout();
          return (_ref2 = _this.iso) != null ? _ref2.arrange() : void 0;
        };
      })(this))["catch"](function(err) {
        return console.error("Could not load tasks: " + err.stack);
      }).done();
    },
    shouldComponentUpdate: function(nextProps, nextState) {
      if (this.state['tasks'].length !== nextState['tasks'].length) {
        return true;
      } else {
        return false;
      }
    },
    componentWillUnmount: function() {
      var _ref1;
      return (_ref1 = this.iso) != null ? typeof _ref1.destroy === "function" ? _ref1.destroy() : void 0 : void 0;
    },
    render: function() {
      var sbrs;
      sbrs = _.chain(this.state.tasks).values().pluck('sbrs').flatten().unique().sort().value();
      return div({}, [
        div({
          className: "btn-group"
        }, this.genBtnGroupLayout()), br({}), br({}), div({
          className: "btn-group"
        }, this.genBtnGroupSbrFilter(sbrs)), br({}), br({}), div({
          className: "btn-group"
        }, this.genBtnGroupSort()), br({}), div({
          id: this.props.id,
          className: 'tasksContainer',
          key: 'tasksContainer',
          ref: 'tasksContainer'
        }, this.genTaskElements())
      ]);
    }
  });

  module.exports = Component;

}).call(this);
