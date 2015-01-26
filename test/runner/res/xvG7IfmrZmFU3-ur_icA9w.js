var esprima;"function"==typeof importScripts?importScripts("A7O0IacRSqMVuogY-Ca7GA.js"):esprima=basis.require("./m.js");
var TRAVERSE_ABORT=1,TRAVERSE_STOP_DEEP=2,NODE_BRANCHES={ArrayExpression:["elements"],AssignmentExpression:["left","right"],BinaryExpression:["left","right"],BlockStatement:["body"],BreakStatement:["label"],CallExpression:["callee","arguments"],CatchClause:["param","body"],ConditionalExpression:["test","consequent","alternate"],ContinueStatement:["label"],DebuggerStatement:[],DoWhileStatement:["test","body"],EmptyStatement:[],ExpressionStatement:["expression"],ForInStatement:["left","right","body"],
ForStatement:["init","test","update","body"],FunctionDeclaration:["id","params","body"],FunctionExpression:["id","params","defaults","body"],Identifier:[],IfStatement:["test","consequent","alternate"],LabeledStatement:["label","body"],Literal:[],LogicalExpression:["left","right"],MemberExpression:["object","property"],NewExpression:["callee","arguments"],ObjectExpression:["properties"],Program:["body"],Property:["key","value"],ReturnStatement:["argument"],SequenceExpression:["expressions"],SwitchCase:["test",
"consequent"],SwitchStatement:["discriminant","cases"],ThisExpression:[],ThrowStatement:["argument"],TryStatement:["block","handlers","finalizer"],UnaryExpression:["argument"],UpdateExpression:["argument"],VariableDeclaration:["declarations"],VariableDeclarator:["id","init"],WhileStatement:["test","body"],WithStatement:["object","body"]};
function parse(b){function g(c){for(var a=NODE_BRANCHES[c.type],b=0,d;d=a[b];b++){var f=c[d];"object"==typeof f&&null!==f&&(Array.isArray(f)?f.forEach(function(a){g(a);a.root=e;a.parentNode=c;a.parentCollection=f}):(g(f),f.root=e,f.parentNode=c))}}var e=esprima.parse(b,{loc:!0,range:!0,comment:!0,tokens:!0});g(e);e.source=b;return e.root=e}
function traverseAst(b,g){var e=g.call(null,b);if(e)return e==TRAVERSE_ABORT?e:!1;for(var e=NODE_BRANCHES[b.type],c=0,a;a=e[c];c++)if(a=b[a],"object"==typeof a&&null!==a)if(Array.isArray(a))for(var h=0,d;d=a[h];h++){if(traverseAst(d,g)&TRAVERSE_ABORT)return TRAVERSE_ABORT}else if(traverseAst(a,g)&TRAVERSE_ABORT)return TRAVERSE_ABORT}function getRangeTokens(b,g,e){for(var c,a=0,h,d;a<b.tokens.length;a++)if(d=b.tokens[a],!(d.range[0]<g)){if(d.range[1]>e){d=h;break}c||(c=d);h=d}return[c,d]}
function getNodeRangeTokens(b){return getRangeTokens(b.root,b.range[0],b.range[1])}function translateAst(b,g,e){for(var c=b.source,a=[],h=0,d,f;h<b.tokens.length;h++)if(f=b.tokens[h],!(f.range[0]<g)){if(f.range[1]>e){f=d;break}(d=c.substring(d?d.range[1]:g,f.range[0]))&&a.push(d);a.push(f.value);d=f}a.push(c.substring(f?f.range[1]:g,e));return a.join("")}function translateNode(b){return translateAst(b.root,b.range[0],b.range[1])}
function wrapSource(b,g){var e=parse(b);"none"==g&&traverseAst(e,function(c){if("Program"!=c.type){if("FunctionExpression"==c.type){var a=getNodeRangeTokens(c),b=translateAst(e,a[0].range[0],a[1].range[1]);a[0].value="__wrapFunctionExpression("+a[0].value;a[1].value+=", "+b+")"}"FunctionDeclaration"==c.type&&(a=getNodeRangeTokens(c.body),a[0].value+="\ntry {\n",a[1].value="\n} catch(e) {__exception(e);throw e;}\n"+a[1].value);if("CallExpression"==c.type&&"ExpressionStatement"==c.parentNode.type){var a=
getNodeRangeTokens(c)[0],b=1==c.arguments.length?c.arguments[0]:null,d="__isFor("+c.range+","+(c.loc.end.line-1)+")",f=a.value.replace(/^__enterLine\(\d+\)/,d);a.value=f!=a.value?f:d+" || "+a.value;b&&"BinaryExpression"==b.type&&b.operator.match(/^(===?)$/)&&(a=c.arguments[0],b=getNodeRangeTokens(a.left),d=getNodeRangeTokens(a.right),b[0].value='__actual("'+a.operator+'",'+b[0].value,b[1].value+=")",d[0].value="__expected("+d[0].value,d[1].value+=")")}if("BlockStatement"==c.parentNode.type||"Program"==
c.parentNode.type)c=getNodeRangeTokens(c)[0],c.value="__enterLine("+(c.loc.start.line-1)+"); "+c.value}});return translateAst(e,0,e.source.length)}"undefined"!=typeof module&&(module.exports={TRAVERSE_ABORT:TRAVERSE_ABORT,TRAVERSE_STOP_DEEP:TRAVERSE_STOP_DEEP,parse:parse,traverseAst:traverseAst,translateAst:translateAst,translateNode:translateNode,getRangeTokens:getRangeTokens,getNodeRangeTokens:getNodeRangeTokens,wrapSource:wrapSource})