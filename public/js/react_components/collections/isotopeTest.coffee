React       = require 'react/react-with-addons'
jQuery      = require 'jquery'
Isotope     = require 'isotope/js/isotope'
#Isotope     = require 'isotope/dist/isotope.pkgd'
AjaxMixin   = require '../mixins/ajaxMixin.coffee'
cx          = React.addons.classSet
d3          = require 'd3/d3'
_           = require 'lodash'

{div, p, button, img, h1, h2, h3, ul, li, span, br} = React.DOM

Component = React.createClass
  displayName: 'TestIsotope'

  # This is for creating the raw dom elements
  genTaskElementsDom: (tasks) ->
    tasks =  _.map tasks, (t) =>
      id = t['_id']
      $("<div id='#{id}' class='#{@genTaskClass(t)}'>#{t['bid']}<div/>")
    #tasks.unshift (div {className: 'grid-sizer'}, [])
    tasks

  changeLayout: (layoutMode) ->
    console.debug "Changing layout to: #{layoutMode}"
    #@setState
    #  layoutName: layoutMode
#    @iso.isotope
#      layoutMode: layoutMode
    @iso.arrange
      layoutMode: layoutMode

  changeSort: (sortByName) ->
    sortLookup =
      'Case Number': 'caseNumber'
    console.debug "Changing sort to: #{sortLookup[sortByName]}"
    @iso.arrange
      sortBy: sortLookup[sortByName]

  genBtnGroupClass: (opts) ->
    classSet =
      'btn': true
      'btn-default': true
      'active': @state[opts['stateVarName']] is opts['var']
    cx(classSet)

  genBtnGroupLayout: () ->
    #layoutModes = ['masonry', 'fitRows', 'cellsByRow', 'vertical', 'masonryHorizontal', 'fitColumns', 'cellsByColumn', 'horizontal']
    layoutModes = ['masonry', 'fitRows', 'vertical']
    _.map layoutModes, (layoutMode) =>
      (button
        key: layoutMode
        type: 'button'
        className: @genBtnGroupClass({stateVarName: 'layoutMode', 'var': layoutMode})
        onClick: @changeLayout.bind(@, layoutMode)
      , [layoutMode])

  genBtnGroupSort: () ->
    #layoutModes = ['masonry', 'fitRows', 'cellsByRow', 'vertical', 'masonryHorizontal', 'fitColumns', 'cellsByColumn', 'horizontal']
    sortBys = ['Score', 'Case Number']
    _.map sortBys, (sortBy) =>
      (button
        key: sortBy
        type: 'button'
        classBy: @genBtnGroupClass({stateVarBy: 'sortBy', 'var': sortBy})
        onClick: @changeSort.bind(@, sortBy)
      , [sortBy])


  idSelector: () -> '#' + @props.id
  createIsotopeContainer: () ->
    self = @
    console.debug "Creating the isotope container"
    self = @
    if not @iso?
      @iso = new Isotope @refs['tasksContainer'].getDOMNode(),
        itemSelector: '.element-item'
        #layoutMode: 'fitRows'
        layoutMode: 'masonry'
        getSortData:
          name: '.name'
          symbol: '.symbol'
          number: '.number parseInt'
          category: '[data-category]'
          weight: ( itemElem ) ->
            weight = $( itemElem ).find('.weight').text();
            parseFloat( weight.replace( /[\(\)]/g, '') );

      @iso.on('layoutComplete', (isoInstance, laidOutItems ) -> console.debug('Layout complete') )
      @iso.on('removeComplete', (isoInstance, laidOutItems ) -> console.debug('Remove complete') )

  componentDidMount: ->
    self = @
    @createIsotopeContainer()
    # bind sort button click
    $('#sorts').on 'click', 'button', ->
      sortByValue = $(@).attr('data-sort-by')
      self.iso.arrange
        sortBy: sortByValue
    $('#addItem').on 'click', ->
      div = """
<div class="element-item transition metal " data-category="transition">
  <h3 class="name">Foo</h3>
  <p class="symbol">Hg</p>
  <p class="number">#{Math.random()}</p>
  <p class="weight">#{Math.random()}</p>
</div>
"""
      $elems = $(div).add($(div)).add($(div))
      $('#tasksContainer').append($elems)
      self.iso.appended($elems)


  shouldComponentUpdate: (nextProps, nextState) ->
    return false

  componentWillUnmount: ->
    @iso?.destroy?()

  render: ->
    (div {}, [
      (h2 {}, ['Add'])
      (button {id: 'addItem', className: "button is-checked"}, ['add Item'])
      (h2 {}, ['Sort'])
      (div {id: "sorts", className: "button-group"}, [
        (button {className: "button is-checked",'data-sort-by':"original-order"}, ['original order'])
        (button {className: "button",'data-sort-by':"name"}, ['name'])
        (button {className: "button",'data-sort-by':"symbol"}, ['symbol'])
        (button {className: "button",'data-sort-by':"number"}, ['number'])
        (button {className: "button",'data-sort-by':"weight"}, ['weight'])
        (button {className: "button",'data-sort-by':"category"}, ['category'])
      ])
      (br {})
      (div {id: @props.id, className: 'tasksContainer', key: 'tasksContainer', ref: 'tasksContainer'}, [
#        (div {className: "element-item transition metal ", 'data-category': "transition"}, [
#          (h3 {className: "name"}, ['Mercury'])
#          (p {className: "symbol"}, ['Hg'])
#          (p {className: "number"}, ['80'])
#          (p {className: "weight"}, ['200.59'])
#        ])
#        (div {className: "element-item transition metalloid ", 'data-category': "transition"}, [
#          (h3 {className: "name"}, ['Tellurium'])
#          (p {className: "symbol"}, ['Te'])
#          (p {className: "number"}, ['52'])
#          (p {className: "weight"}, ['127.6'])
#        ])
#        (div {className: "element-item transition metal ", 'data-category': "transition"}, [
#          (h3 {className: "name"}, ['Bismuth'])
#          (p {className: "symbol"}, ['Bi'])
#          (p {className: "number"}, ['82'])
#          (p {className: "weight"}, ['208.980'])
#        ])
      ])
    ])

module.exports = Component
