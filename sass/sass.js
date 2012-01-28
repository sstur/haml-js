"use strict";
var App = require('../core');
var Sass = Object.create(App);

Sass.Exception = App.Exception.extend({
  /**
   * @param {String} message - Exception message
   * @param {Object} params - parameters to be applied to the message using `strtr`.
   * @param {Object} object - object with source code and meta data
   */
  init: function(message, params, object) {
    this._super('sass', message, params, object);
  }
});

Sass.NodeException = Sass.Exception.extend({});
Sass.ContextException = Sass.NodeException.extend({});
Sass.CommentNodeException = Sass.NodeException.extend({});
Sass.DebugNodeException = Sass.NodeException.extend({});
Sass.DirectiveNodeException = Sass.NodeException.extend({});
Sass.ExtendNodeException = Sass.NodeException.extend({});
Sass.ForNodeException = Sass.NodeException.extend({});
Sass.IfNodeException = Sass.NodeException.extend({});
Sass.ImportNodeException = Sass.NodeException.extend({});
Sass.MixinDefinitionNodeException = Sass.NodeException.extend({});
Sass.MixinNodeException = Sass.NodeException.extend({});
Sass.PropertyNodeException = Sass.NodeException.extend({});
Sass.RuleNodeException = Sass.NodeException.extend({});
Sass.VariableNodeException = Sass.NodeException.extend({});
Sass.WhileNodeException = Sass.NodeException.extend({});

Sass.ScriptParserException = Sass.Exception.extend({});
Sass.ScriptLexerException = Sass.ScriptParserException.extend({});
Sass.ScriptOperationException = Sass.ScriptParserException.extend({});
Sass.ScriptFunctionException = Sass.ScriptParserException.extend({});
