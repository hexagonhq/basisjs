module.exports = {
  name: 'basis.ui',

  init: function(){
    basis.require('basis.ui');
    basis.require('basis.dom');

    var domHelpers = basis.require('./helpers/dom_wrapper_node.js');

    function getTestNodes(count){
      return basis.data.wrap(basis.array.create(count || 10, basis.fn.$self), true);
    }

    function getTopGrouping(node){
      var cursor = node;
      while (cursor.grouping)
        cursor = cursor.grouping;
      return cursor !== node ? cursor : null;
    }

    function checkNode(node, groupingLevel){
      var res;

      if (!groupingLevel)
        groupingLevel = 0;

      if (res = domHelpers.checkNode(node))
        return 'basis.dom.wrapper: ' + res;

      if (node.childNodes)
      {
        var nestedElements = basis.dom.axis(node.element, basis.dom.AXIS_DESCENDANT);
        var lastChildElementIndex = -1;

        for (var i = 0; i < node.childNodes.length; i++)
        {
          var child = node.childNodes[i];
          var target = child.groupNode || node;
          var containerElement = target.childNodesElement || node.childNodesElement;

          if (child.element.parentNode !== containerElement)
            return 'Child #' + i + ' element has wrong container (parentNode element reference)';

          // check position
          var childElementIndex = nestedElements.indexOf(child.element);

          if (childElementIndex == -1)
            return 'Child #' + i + ' element has not found in parent DOM fragment';

          if (childElementIndex < lastChildElementIndex)
            return 'Child #' + i + ' element has wrong position';

          lastChildElementIndex = childElementIndex;
        }
      }

      if (node.grouping)
        if (res = checkNode(node.grouping, groupingLevel + 1))
          return 'Grouping level ' + (groupingLevel + 1) + ': ' + res;

      return false;
    }
  },

  test: [
    {
      name: 'Template update',
      test: [
        {
          name: 'grouping, node template update',
          test: function(){
            var node = new basis.ui.Node({
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2'
              }
            });

            this.is(false, checkNode(node));
            this.is(10, node.childNodes.length);

            node.setTemplate(new basis.template.html.Template('<div/>'));
            this.is(false, checkNode(node));
          }
        },
        {
          name: 'node with groupsElement, grouping, node template update',
          test: function(){
            var node = new basis.ui.Node({
              template:
                '<div>' +
                  '<div{childNodesElement}></div>' +
                  '<div{groupsElement}></div>' +
                '</div>',
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2'
              }
            });

            this.is(false, checkNode(node));
            this.is(0, node.childNodesElement.childNodes.length);
            this.is(2, node.tmpl.groupsElement.childNodes.length);

            node.setTemplate(new basis.template.html.Template(
              '<div>' +
                '<div{groupsElement}></div>' +
                '<div{childNodesElement}></div>' +
              '</div>'
            ));
            this.is(false, checkNode(node));
            this.is(0, node.childNodesElement.childNodes.length);
            this.is(2, node.tmpl.groupsElement.childNodes.length);
          }
        },
        {
          name: 'grouping with null group, no groups, node template update',
          test: function(){
            var node = new basis.ui.Node({
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2',
                dataSource: new basis.data.Dataset()
              }
            });

            this.is(false, checkNode(node));
            this.is(true, node.grouping.firstChild === null);

            node.setTemplate(new basis.template.html.Template('<div/>'));
            this.is(false, checkNode(node));
          }
        },
        {
          name: 'grouping with null group, with groups, node template update',
          test: function(){
            var node = new basis.ui.Node({
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2',
                dataSource: new basis.data.Dataset({
                  items: [new basis.data.Object()]
                })
              }
            });

            this.is(false, checkNode(node));
            this.is(true, node.grouping.firstChild !== null);

            node.setTemplate(new basis.template.html.Template('<div/>'));
            this.is(false, checkNode(node));
          }
        },
        {
          name: 'node with groupsElement, grouping with null group, no groups, node template update',
          test: function(){
            // null group nodes put to childNodesElement
            var node = new basis.ui.Node({
              template:
                '<div>' +
                  '<div{childNodesElement}></div>' +
                  '<div{groupsElement}></div>' +
                '</div>',
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2',
                dataSource: new basis.data.Dataset()
              }
            });

            this.is(false, checkNode(node));
            this.is(10, node.childNodesElement.childNodes.length);
            this.is(0, node.tmpl.groupsElement.childNodes.length);
            this.is(true, node.grouping.firstChild === null);

            node.setTemplate(new basis.template.html.Template(
              '<div>' +
                '<div{groupsElement}></div>' +
                '<div{childNodesElement}></div>' +
              '</div>'
            ));
            this.is(false, checkNode(node));
            this.is(10, node.childNodesElement.childNodes.length);
            this.is(0, node.tmpl.groupsElement.childNodes.length);
          }
        },
        {
          name: 'node with groupsElement, grouping with null group, has groups, node template update',
          test: function(){
            // null group nodes put to childNodesElement
            var node = new basis.ui.Node({
              template:
                '<div>' +
                  '<div{childNodesElement}></div>' +
                  '<div{groupsElement}></div>' +
                '</div>',
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2',
                dataSource: new basis.data.Dataset({
                  items: [new basis.data.Object()]
                })
              }
            });

            this.is(false, checkNode(node));
            this.is(10, node.childNodesElement.childNodes.length);
            this.is(1, node.tmpl.groupsElement.childNodes.length);
            this.is(true, node.grouping.firstChild !== null);

            node.setTemplate(new basis.template.html.Template(
              '<div>' +
                '<div{groupsElement}></div>' +
                '<div{childNodesElement}></div>' +
              '</div>'
            ));
            this.is(false, checkNode(node));
            this.is(10, node.childNodesElement.childNodes.length);
            this.is(1, node.tmpl.groupsElement.childNodes.length);
          }
        },
        {
          name: 'nested grouping, node template update',
          test: function(){
            var node = new basis.ui.Node({
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2',
                grouping: {
                  rule: 'data.id % 2'
                }
              }
            });

            this.is(false, checkNode(node));

            node.setTemplate(new basis.template.html.Template('<div/>'));
            this.is(false, checkNode(node));
          }
        },
        {
          name: 'grouping, partition node template update',
          test: function(){
            var node = new basis.ui.Node({
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2'
              }
            });

            this.is(false, checkNode(node));
            this.is(5, node.grouping.firstChild.nodes.length);

            node.grouping.firstChild.setTemplate(new basis.template.html.Template('<span/>'));
            this.is(false, checkNode(node));
            this.is(true, node.grouping.firstChild.element.tagName == 'SPAN');
          }
        },
        {
          name: 'nested grouping, partition template update',
          test: function(){
            var node = new basis.ui.Node({
              childNodes: getTestNodes(10),
              grouping: {
                rule: 'data.value % 2',
                grouping: {
                  rule: 'data.id % 2'
                }
              }
            });

            this.is(false, checkNode(node));

            // 1st level grouping partition node change
            var partitionNode = node.grouping.firstChild;
            partitionNode.setTemplate(new basis.template.html.Template('<span/>'));
            this.is(false, checkNode(node));
            this.is(true, partitionNode.element.tagName == 'SPAN');

            // 2st level grouping partition node change
            var partitionNode = node.grouping.grouping.firstChild;
            partitionNode.setTemplate(new basis.template.html.Template('<span/>'));
            this.is(false, checkNode(node));
            this.is(true, partitionNode.element.tagName == 'SPAN');
          }
        }
      ]
    },
    require('./ui/calendar.js')
  ]
};
