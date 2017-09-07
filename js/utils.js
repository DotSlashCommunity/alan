/*
	@author ksdme
	contains js utils
*/

var Validator = {

	roll: function(roll) {
		return roll > 100000000 && roll < 99999999999
	},

	phone: function(phone) {
		return phone > 6000000000 && phone < 9999999999
	}

}

var Template = {

	from: function(id) {
		template = $("#"+id).html()
	
		return (function(template){
			return {
				render: function(args) {
					for (key in args) {
						repl = "{{"+key+"}}"
						template = 	template.replace(repl, args[key])
					}

					return template
				},

				raw: function(){ return template }
			}
		})(template)
	}
}

var AlanServer = {

	from: function(url) {

		if (url.substr(-1) == "/")
			url = url.substr(0, url.length-1)

		return 	(function(url){
			return	{
				query: function(endpoint, data, success, error) {
					
					if (!error)
						error = function(jqXHR, textStatus, errorThrown) {
							alert("Internal Error, \nPlease contact the Quiz Co-ordinator.\n\nStatus: "+textStatus+", Error: "+(errorThrown?errorThrown:"None"))
						}

					$.ajax({
						data: data,
						error: error,
						method: "GET",
						success: success,
						dataType: "json",
						url: url+endpoint,
						xhrFields: {
						    withCredentials: true
						}
					})
				}
			}
		})(url)
	}
}
