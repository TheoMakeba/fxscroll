/*
 * fxscroll
 * v1.0.0
 */
 
(function(global,fnc){

	if(typeof module == 'object' && typeof module.exports == 'object'){
		module.exports = global.document ? 
		fnc(global,false) :
		function(w){
			if(!w.document){
				throw new Error('This library requires a window with a document');
			};
			return fnc(w);
		}
	}
	else {
		fnc(global);
	}

})(typeof window !== 'undefined' ? window : this,function(window,wincase){

'use-strict'


var pn_flow 	 = 'flow';
var pn_after     = 'clear';
var __contextProperty = 'context';


var isArray = function(arg){ return Array.isArray(arg); };

var isObject = function(arg){ return (typeof arg == 'object') ? true : false; };

var isDOMNode = function(arg){ return (typeof arg.nodeType != 'undefined' || typeof arg.nodeName != 'undefined') ? true : false; };

var isString = function(arg){ return (typeof arg == 'string') ? true : false; };

var isDefined = function(arg){ return (typeof arg != 'undefined') ? true : false; };

var hasClass = function(el,clsname)
{
	clsname = clsname.trim(); 
	var clsString = el.getAttribute('class');
	var reg = new RegExp('(\\s+'+clsname+'\\s+)','g');
	return (clsString.match(reg) != null ) ? true : false;
}

function CSSClasses()
{	
	var classes = 
	{
		'nonObserved' : 'non-observed-element',
		'observed': 'is-observed-element',
		'fx-class' : 'fxscroll-fx'
	};
	
	var fx_classes = 
	{
		'b-t' : 'bottom-top-view',
		't-b' : 'top-bottom-view',
		'r-l' : 'right-left-view',
		'l-r' : 'left-right-view',
		'scale-in': 'scale-in-view',
	};
	
	this.getFxRootClass = function(){ return classes['fx-class'] };
	
	this.getClass = function(clsName){ return classes[clsName]; };
	
	this.getFx = function(fxshortcut){ return (fx_classes[fxshortcut]) ? fx_classes[fxshortcut] : fx_classes['b-t']; }
};
var CSSRepository = new CSSClasses();


const defaultOptionsForAll = {
	ratio : 0.2,
	flow : CSSRepository.getFx('b-t'),
	clear : false
}

function getRatioFromParameter(options)
{
	var ratio = options['ratio'];
	if(typeof ratio == 'undefined' || ratio == null){ return 0.3; }
	else 
	{
		ratio = parseFloat(ratio);
		if(ratio.toString() !== 'NaN'){ ratio = 0.3; }
		else
		{ 
			if(ratio > 1 || ratio <= 0){ ratio = 0.3; }
		};
		return ratio;
	}
}



function ManageableObject(obj)
{
	var element   = obj['node'];
	var opts     = obj['options'];
	var flow	  = CSSRepository.getFx(opts[pn_flow].toString());
	var ratio     = getRatioFromParameter(opts);  
	var hideWhenNotVisible = opts[pn_after] || false;
	
	var fxclass = CSSRepository.getFxRootClass('fxClass');
	var hideClass = CSSRepository.getClass('nonObserved');
	var showClass = CSSRepository.getClass('observed');
	
	var elHeight  = element.getBoundingClientRect().height;
	var winHeight = window.innerHeight;
	var docHeight = document.body.getBoundingClientRect().height;
	
	if(elHeight >= winHeight){ ratio = 0.3; }
	var expectedMinHeight = elHeight * ratio;
	

	function showElement()
	{
		if(!hasClass(element, showClass)){ element.classList.add(showClass); }
	}
	
	function checkHiddabilityWhenNotVisible()
	{		
		if(hideWhenNotVisible == true){	element.classList.remove(showClass); } 
	}
	
	function calculateElementPosition()
	{
		var elementTopPosition = element.getBoundingClientRect().top;
		var distanceBetweenElementTopAndWindowBottom = winHeight - elementTopPosition;
		var isInViewInterval = (elementTopPosition < winHeight && elementTopPosition >= 0);		
		
		if(elementTopPosition < 0)
		{
			if(elementTopPosition*(-1) >= expectedMinHeight){ checkHiddabilityWhenNotVisible(); }
		}
		else 
		{
			if(isInViewInterval && distanceBetweenElementTopAndWindowBottom >= expectedMinHeight){ showElement(); }
			else { checkHiddabilityWhenNotVisible(); }			
		}		
	}
	
	function boot()
	{
		var timer = setTimeout(function()
		{
			calculateElementPosition();
			clearTimeout(timer);
		},100);
	};
	
	this.listernScroll = function()
	{
		window.addEventListener('scroll',function(){ boot(); });
		window.addEventListener('resize',function(){ boot(); });		
	}
	
	element.classList.add(fxclass);
	element.classList.add(flow);	
	element.classList.add(hideClass);
	boot();
}



function ManagingContext()
{
	
	var objectArgs = arguments;
	var describer = objectArgs[0];
	var describerTargetType;
	if(describer['target'] && isArray(describer['target'])){ describerTargetType =  describer['target']; }
	else { throw new  Error('The target property must be an array'); };
	
	var describerOptions = (describer['options'] && isObject(describer['options'])) ? describer['options'] : defaultOptionsForAll;
	
	function createManageableObjectAndInitIt(node)
	{
		var obj = {};
		obj['node'] = node;
		obj['options'] = describerOptions;
		var manageableObject = new ManageableObject(obj);	
		manageableObject.listernScroll();
	}
	
	function loopOnSelectorString(stringSelector)
	{
		try 
		{
			var nodes = document.querySelectorAll(stringSelector);
			if(nodes && nodes != null)
			{
				for(var i=0; i<nodes.length; i++){ createManageableObjectAndInitIt(nodes[i]); }
			}
		}
		catch(e){ console.log('---ERROR---\n\nINVALID SELECTOR : '+ stringSelector); }
	}
	
	function initObservations()
	{	
		describerTargetType.forEach(function(arrayElementType){
			if(isString(arrayElementType) && arrayElementType.trim().length > 0){
				loopOnSelectorString(arrayElementType);
			}
			else {
				if(isObject(arrayElementType) && isDOMNode(arrayElementType)){
					createManageableObjectAndInitIt(arrayElementType);
				}
			}
		});
	};
	
	this.init = function()
	{
		initObservations();	
	}
}


function fxscroll()
{
	var contextStatck = [];
	
	this.createContext = function()
	{
		var props = arguments[0];
		if(props)
		{
			if(isObject(props) && props[__contextProperty] && isArray(props[__contextProperty]))
			{
				var definers = props[__contextProperty];
				definers.forEach(function(describer)
				{
					var managingContextRef = new ManagingContext(describer);
					contextStatck.push(managingContextRef);
				});
			}
		}
	};
	
	function initCheck()
	{
		contextStatck.forEach(function(managingContext)
		{
			managingContext.init();
		});
	};
	
	this.init = function(props){ initCheck(); }
}


if(typeof wincase == 'undefined')
{
	window.fxscroll = fxscroll;
}

return fxscroll;
});


/*
 * Github : TheoMakeba
 * email : theomakeba@gmail.com.
 */