(this["webpackJsonpshopping-app"]=this["webpackJsonpshopping-app"]||[]).push([[1],{447:function(t,e,n){"use strict";n.r(e),n.d(e,"pwa_action_sheet",(function(){return a}));var i=n(6),o=n(7),s=n(108),a=function(){function t(e){Object(i.a)(this,t),Object(s.h)(this,e),this.onSelection=Object(s.c)(this,"onSelection",7),this.header=void 0,this.cancelable=!0,this.options=[],this.open=!1}return Object(o.a)(t,[{key:"componentDidLoad",value:function(){var t=this;requestAnimationFrame((function(){t.open=!0}))}},{key:"dismiss",value:function(){this.cancelable&&this.close()}},{key:"close",value:function(){var t=this;this.open=!1,setTimeout((function(){t.el.parentNode.removeChild(t.el)}),500)}},{key:"handleOptionClick",value:function(t,e){t.stopPropagation(),this.onSelection.emit(e),this.close()}},{key:"render",value:function(){var t=this;return Object(s.f)("div",{class:"wrapper".concat(this.open?" open":""),onClick:function(){return t.dismiss()}},Object(s.f)("div",{class:"content"},Object(s.f)("div",{class:"title"},this.header),this.options.map((function(e,n){return Object(s.f)("div",{class:"action-sheet-option",onClick:function(e){return t.handleOptionClick(e,n)}},Object(s.f)("div",{class:"action-sheet-button"},e.title))}))))}},{key:"el",get:function(){return Object(s.e)(this)}}]),t}();a.style=':host{z-index:1000;position:fixed;top:0;left:0;width:100%;height:100%;display:flex;contain:strict;user-select:none;font-family:-apple-system, BlinkMacSystemFont, "Helvetica Neue", "Roboto", sans-serif}.wrapper{flex:1;display:flex;align-items:center;justify-content:center;background-color:rgba(0, 0, 0, 0);transition:400ms background-color cubic-bezier(.36,.66,.04,1)}.wrapper.open{background-color:rgba(0, 0, 0, 0.32)}.title{color:#999;height:23px;line-height:23px;padding-bottom:17px;padding-inline-end:16px;padding-inline-start:16px;padding-left:16px;padding-right:16px;padding-top:20px}.content{width:568px;align-self:flex-end;background-color:#fff;transition:400ms transform cubic-bezier(.36,.66,.04,1);transform:translateY(100%)}.wrapper.open .content{transform:translateY(0%)}@media only screen and (max-width: 568px){.content{width:100%}}.action-sheet-option{cursor:pointer;height:52px;line-height:52px}.action-sheet-button{color:rgb(38, 38, 38);font-size:16px;padding-inline-end:16px;padding-inline-start:16px;padding-left:16px;padding-right:16px;padding-top:0px}.action-sheet-button:hover{background-color:#F6F6F6}'}}]);
//# sourceMappingURL=1.5ff2afa5.chunk.js.map