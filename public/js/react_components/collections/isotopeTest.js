(function() {
  var AjaxMixin, Component, Isotope, React, br, button, cx, d3, div, h1, h2, h3, img, jQuery, li, p, span, ul, _, _ref;

  React = require('react/react-with-addons');

  jQuery = require('jquery');

  Isotope = require('isotope/js/isotope');

  AjaxMixin = require('../mixins/ajaxMixin.coffee');

  cx = React.addons.classSet;

  d3 = require('d3/d3');

  _ = require('lodash');

  _ref = React.DOM, div = _ref.div, p = _ref.p, button = _ref.button, img = _ref.img, h1 = _ref.h1, h2 = _ref.h2, h3 = _ref.h3, ul = _ref.ul, li = _ref.li, span = _ref.span, br = _ref.br;

  Component = React.createClass({
    displayName: 'TestIsotope',
    genTaskElementsDom: function(tasks) {
      tasks = _.map(tasks, (function(_this) {
        return function(t) {
          var id;
          id = t['_id'];
          return $("<div id='" + id + "' class='" + (_this.genTaskClass(t)) + "'>" + t['bid'] + "<div/>");
        };
      })(this));
      return tasks;
    },
    changeLayout: function(layoutMode) {
      console.debug("Changing layout to: " + layoutMode);
      return this.iso.arrange({
        layoutMode: layoutMode
      });
    },
    changeSort: function(sortByName) {
      var sortLookup;
      sortLookup = {
        'Case Number': 'caseNumber'
      };
      console.debug("Changing sort to: " + sortLookup[sortByName]);
      return this.iso.arrange({
        sortBy: sortLookup[sortByName]
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
      layoutModes = ['masonry', 'fitRows', 'vertical'];
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
      sortBys = ['Score', 'Case Number'];
      return _.map(sortBys, (function(_this) {
        return function(sortBy) {
          return button({
            key: sortBy,
            type: 'button',
            classBy: _this.genBtnGroupClass({
              stateVarBy: 'sortBy',
              'var': sortBy
            }),
            onClick: _this.changeSort.bind(_this, sortBy)
          }, [sortBy]);
        };
      })(this));
    },
    idSelector: function() {
      return '#' + this.props.id;
    },
    createIsotopeContainer: function() {
      var self;
      self = this;
      console.debug("Creating the isotope container");
      self = this;
      if (this.iso == null) {
        this.iso = new Isotope(this.refs['tasksContainer'].getDOMNode(), {
          itemSelector: '.element-item',
          layoutMode: 'masonry',
          getSortData: {
            name: '.name',
            symbol: '.symbol',
            number: '.number parseInt',
            category: '[data-category]',
            weight: function(itemElem) {
              var weight;
              weight = $(itemElem).find('.weight').text();
              return parseFloat(weight.replace(/[\(\)]/g, ''));
            }
          }
        });
        this.iso.on('layoutComplete', function(isoInstance, laidOutItems) {
          return console.debug('Layout complete');
        });
        return this.iso.on('removeComplete', function(isoInstance, laidOutItems) {
          return console.debug('Remove complete');
        });
      }
    },
    componentDidMount: function() {
      var self;
      self = this;
      this.createIsotopeContainer();
      $('#sorts').on('click', 'button', function() {
        var sortByValue;
        sortByValue = $(this).attr('data-sort-by');
        return self.iso.arrange({
          sortBy: sortByValue
        });
      });
      return $('#addItem').on('click', function() {
        var $elems;
        div = "<div class=\"element-item transition metal \" data-category=\"transition\">\n  <h3 class=\"name\">Foo</h3>\n  <p class=\"symbol\">Hg</p>\n  <p class=\"number\">" + (Math.random()) + "</p>\n  <p class=\"weight\">" + (Math.random()) + "</p>\n</div>";
        $elems = $(div).add($(div)).add($(div));
        $('#tasksContainer').append($elems);
        return self.iso.appended($elems);
      });
    },
    shouldComponentUpdate: function(nextProps, nextState) {
      return false;
    },
    componentWillUnmount: function() {
      var _ref1;
      return (_ref1 = this.iso) != null ? typeof _ref1.destroy === "function" ? _ref1.destroy() : void 0 : void 0;
    },
    render: function() {
      return div({}, [
        h2({}, ['Add']), button({
          id: 'addItem',
          className: "button is-checked"
        }, ['add Item']), h2({}, ['Sort']), div({
          id: "sorts",
          className: "button-group"
        }, [
          button({
            className: "button is-checked",
            'data-sort-by': "original-order"
          }, ['original order']), button({
            className: "button",
            'data-sort-by': "name"
          }, ['name']), button({
            className: "button",
            'data-sort-by': "symbol"
          }, ['symbol']), button({
            className: "button",
            'data-sort-by': "number"
          }, ['number']), button({
            className: "button",
            'data-sort-by': "weight"
          }, ['weight']), button({
            className: "button",
            'data-sort-by': "category"
          }, ['category'])
        ]), br({}), div({
          id: this.props.id,
          className: 'tasksContainer',
          key: 'tasksContainer',
          ref: 'tasksContainer'
        }, [])
      ]);
    }
  });

  module.exports = Component;

}).call(this);
