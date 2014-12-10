var inspectBasis = require('devpanel').inspectBasis;
var inspectBasisTemplate = inspectBasis.require('basis.template');
var inspectBasisTemplateMarker = inspectBasis.require('basis.template.html').marker;

var fileAPI = require('../../api/file.js');
var parseDom = require('./parse-dom.js');
var buildTree = require('./build-tree.js');
var DataObject = require('basis.data').Object;
var Dataset = require('basis.data').Dataset;
var Node = require('basis.ui').Node;
var Window = require('basis.ui.window').Window;
var hoveredBinding = require('./binding.js').hover;
var selectedDomNode = new basis.Token();
var selectedObject = selectedDomNode.as(function(node){
  return node ? inspectBasisTemplate.resolveObjectById(node[inspectBasisTemplateMarker]) : null;
});
var selectedTemplate = selectedDomNode.as(function(node){
  var template = node ? inspectBasisTemplate.resolveTemplateById(node[inspectBasisTemplateMarker]) : null;
  if (this.value)
    this.value.bindingBridge.detach(this.value, syncSelectedNode);
  if (template)
    template.bindingBridge.attach(template, syncSelectedNode);
  return template;
});
var bindingDataset = new Dataset();
var isolatePrefix;

selectedDomNode.as(require('./binding.js').getBindingsFromNode).attach(bindingDataset.set, bindingDataset);

function syncSelectedNode(){
  var element = selectedObject.value && selectedObject.value.element;
  if (selectedDomNode.value === element)
    selectedDomNode.apply();
  else
    selectedDomNode.set(element);
}

// dom mutation observer
var observer = (function(){
  var names = ['MutationObserver', 'WebKitMutationObserver'];

  for (var i = 0, name; name = names[i]; i++)
  {
    var ObserverClass = global[name];
    if (typeof ObserverClass == 'function')
      return new ObserverClass(syncSelectedNode);
  }

  // fallback for case if MutationObserver doesn't support
  setInterval(syncSelectedNode, 100);
})();

selectedDomNode.attach(function(node){
  if (observer)
    observer.disconnect();

  if (observer && node)
    observer.observe(node, {
      subtree: true,
      attributes: true,
      characterData: true,
      childList: true
    });
});

selectedDomNode.attach(function(node){
  if (!node)
    return view.clear();

  var nodes = parseDom(node);
  var bindings = inspectBasisTemplate.getDebugInfoById(nodes[0][inspectBasisTemplateMarker]) || [];

  view.setChildNodes(buildTree(nodes, bindings));
});

var view = new Window({
  modal: true,
  visible: selectedDomNode.as(Boolean),
  template: resource('./template/template-info.tmpl'),
  binding: {
    upName: selectedObject.as(function(object){
      if (object)
        return object.parentNode ? 'parent' : object.owner ? 'owner' : '';
    }),
    sourceTitle: selectedTemplate.as(function(template){
      if (template)
        return template.source.url || '[inline]';
    }),
    isFile: selectedTemplate.as(function(template){
      if (template)
        return !!template.source.url;
    }),
    bindings: new Node({
      dataSource: bindingDataset,
      sorting: 'data.name',
      grouping: {
        rule: 'data.used',
        childClass: {
          template: resource('./template/template-info-binding-group.tmpl'),
          binding: {
            name: function(node){
              return node.data.id ? 'used' : 'notUsed';
            }
          },
          action: {
            log: function(){
              if (selectedDomNode.value)
              {
                var id = selectedDomNode.value[inspectBasisTemplateMarker];
                var object = selectedObject.value;
                var objectBinding = object.binding;
                var templateBinding = selectedTemplate.value.getBinding();
                var result = {};

                for (var key in objectBinding)
                  if (key != '__extend__' && key != 'bindingId')
                    if (templateBinding.names.indexOf(key) != -1)
                      result[key] = objectBinding[key].getter(object);  // TODO: return real template values

                global.$lastInspectValue = result;
                console.log(result);
              }
            }
          }
        },
        sorting: function(node){
          return Number(!node.data.id);
        }
      },
      childClass: {
        template: resource('./template/template-info-binding.tmpl'),
        binding: {
          name: 'data:',
          value: 'data:',
          used: 'data:',
          loc: 'data:',
          highlight: hoveredBinding.compute('update', function(node, value){
            return node.data.used ? !value || node.data.name === value : false;
          })
        },
        action: {
          enter: function(){
            if (this.data.used)
              hoveredBinding.set(this.data.name);
          },
          leave: function(){
            hoveredBinding.set();
          },
          pickValue: function(){
            if (this.data.loc)
              fileAPI.openFile(this.data.loc);
          }
        }
      }
    })
  },
  action: {
    up: function(){
      var object = selectedObject.value;
      selectedDomNode.set((object.parentNode || object.owner).element);
    },
    down: function(e){
      //if (e.sender.title)
    },
    close: function(){
      selectedDomNode.set();
    },
    openSource: function(){
      var template = selectedTemplate.value;
      if (template && template.source.url)
        fileAPI.openFile(template.source.url);
    }
  },

  realign: function(){},
  setZIndex: function(){},
  init: function(){
    Window.prototype.init.call(this);
    this.dde.fixLeft = false;
    this.dde.fixTop = false;
  }
});

isolatePrefix = view.template.getIsolatePrefix();

module.exports = selectedDomNode;
