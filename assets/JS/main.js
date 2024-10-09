document.addEventListener("DOMContentLoaded", function(){
	var ctx = new fxscroll();
	ctx.createContext({
		'context' : [
			{
				target : ['.rtl-mov'],
				options : {
					ratio : 0.2,
					flow : 'r-l',
					clear : false,
				}
			},
			{
				target : ['.ltr-mov'],
				options : {
					ratio : 0.2,
					flow : 'l-r',
					clear : false,
				}
			},
			{
				target : ['.scin-mov'],
				options : {
					ratio : 0.2,
					flow : 'scale-in',
					clear : false,
				}
			},
			{
				target : ['.ttb-mov'],
				options : {
					ratio : 0.2,
					flow : 't-b',
					clear : true,
				}
			}	
		]
	});
	
	ctx.init();
});