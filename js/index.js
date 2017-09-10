/*
	@author ksdme
	contains index specific js
*/

/* make yourself some globals */
var roll_field, phone_field
roll_view_host = $("#right-menu-host")

modal_host = $("#modal-host")
input_rack_host = $("#input-rack-host")

/* the server */
alan = AlanServer.from(SERVER)

/* load sign in rack */
var load_sign_in_rack = function() {
	input_rack_host.html(Template.from("sign-in-rack").render())

	/* load those babis back */
	roll_field = $("#roll-field")
	phone_field = $("#phone-field")
}

var load_sign_out_rack = function() {
	input_rack_host.html(Template.from("sign-out-rack").render())
}

/* sync the local roll view */
var sync_roll_view = function() {

	alan.query("/me", {},
		function(me) {
			/* on success */

			/* decide on template */
			from = me.m == false?"default-roll-view":"user-roll-view"
			template = Template.from(from)

			/* render template to holder */
			roll_view_host.html(template.render({
				roll: me.m
			}))

			/* if no one is logged in load sign in rack */
			if (me.m == false)
				load_sign_in_rack()
			else
				load_sign_out_rack()
		}) 

}

/* internal functions */
var notify_error_field = function(field) {
	field.parent().addClass("error")
	field.parent().transition("shake")
}

/* on doc ready */
$(function(){

	/* update the roll view initially */
	sync_roll_view()

	/* hook up all the events */
	$(document.body).on('click', "#sign-in-button", function(elm) {
		pass_flag = true
		if (!Validator.roll(roll_field.val())){
			notify_error_field(roll_field)
			pass_flag = false
		}

		if (!Validator.phone(phone_field.val())) {
			notify_error_field(phone_field)
			pass_flag = false
		}

		if (pass_flag) {
			alan.query(
				"/login", {
					"r": roll_field.val(),
					"p": phone_field.val()
				},

				function(response) {
					/* on success */

					if (response.e) {
						modal = false
						if (response.m == "r")
							notify_error_field(roll_field)
						
						if (response.m == "p")
							notify_error_field(phone_field)
						
						if (response.m == "qe")
							window.location.href = 'thanks.html';

						else if (response.m == "lf")
							modal = {
								"icon": "smile",
								"title": "Login Locked!",
								"message": "Sorry<br/>To ensure that we face no malicious activity we temporarily locked new logins!"
							}

						else if (response.m == "m")
							modal = {
								"icon": "smile",
								"title": "Your Account Is Active Somewhere Else",
								"message": "Sorry,<br/>To ensure that we face no malicious activity we do not support simultaneous logins!"
							}

						else if (response.m == "a")
							modal = {
								"icon": "smile",
								"title": "Please Sign Out before logging in again!",
								"message": "You'll have to log out before logging in with an another account!"
							}

						else if (response.m == "s")
							modal = {
								"icon": "meh",
								"title": "On-Site Registration Necessary",
								"message": "On-Site Registration is necessary, Please contact one of the Co-Ordinators"
							}

						if (modal !== false) {
							modal_host.replaceWith(Template.from("basic-modal").render(modal))
							$('.ui.basic.modal').modal('show')
						}

					} else {
						/* sync the view */
						sync_roll_view()
					}

				})
			}
		})

		/* hook up signout */
		$(document.body).on('click', "#sign-out", function() {

			/* send a request and quit */
			alan.query("/logout", {}, function(response) {

				if (response.e) {
					if (response.m == "qe")
						window.location.href = 'thanks.html';

					else if (response.m == "lf")
						modal = {
							"icon": "smile",
							"title": "Logout Locked!",
							"message": "Sorry<br/>To ensure that we face no malicious activity we temporarily locked logouts!"
						}

					if (modal !== false) {
						modal_host.replaceWith(Template.from("basic-modal").render(modal))
						$('.ui.basic.modal').modal('show')
					}
				}

				/* sign out stuff */
				load_sign_in_rack()
				sync_roll_view()

			})

		})
	}
)
