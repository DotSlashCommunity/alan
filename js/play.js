/*
	@author ksdme
	play specific js
*/

/* 	I love globals and I'll have them
	no matter what happens
*/
var opt_a, opt_b, opt_c, opt_d, all_opts, already_sub_msg;
var all_q_pills, q_host, modal_host, base_modal, timer
var already_answered = [], submission_modal
answer = false
global_qno = -1
next_q_qno = -1

/* huh, AlanServer */
alan = AlanServer.from(SERVER)

var reloadQPillBar = function() {
	alan.query(
		"/answered", {}, function(answrd) {
			already_answered = answrd
			remakeQPillBar()
		})
}

var remakeQPillBar = function(active) {
	all_q_pills.removeClass("app-active")
	flag = false

	for (q in already_answered) {
		var l = parseInt(already_answered[q])
		
		klass = "already"
		if (active == l) {
			klass = "active-already"; flag = true;
		}

		$(all_q_pills[l-1]).removeClass("active-already");
		$(all_q_pills[l-1]).addClass(klass);
	}

	if (!flag)
		$(all_q_pills[active-1]).addClass("app-active")
}

var loadQuestion = function(qno) {

	/*
		to load a question,
		we need to have on
	*/
	alan.query(
		"/question/"+qno, {},
		function(q) {
			/* on success */

			/* got true question */
			if (!q.e) {
				opt_a.text(q.o[0]); opt_b.text(q.o[1]);
				opt_c.text(q.o[2]); opt_d.text(q.o[3]);

				/* add question */
				q_host.html(q.q)

				/* set buttons */
				all_opts.each(function(l, elm) {
					ol = "option-plain"
					nw = "option"

					if (q.l) {
						nw = ol
						ol = "option"
					}

					$(elm).removeClass(ol).addClass(nw)
				})

				/* */
				if (!q.l)
					already_sub_msg.addClass("hidden")
				else
					already_sub_msg.removeClass("hidden")

				/* mark active question pill */
				remakeQPillBar(qno)

				/* set the qno */
				global_qno = qno
			}

			/* if didn't get any q */
			if (q.e) {
				modal = false
				if (q.m == "qf") {
					modal = {
						icon: "meh",
						title: "Quiz Freezed!",
						extras: "hidden",
						message: "Sorry<br/>The Quiz has been freezed, Contact Quiz Co-orinator."
					}
				
				} else if (q.m == "qe") {
					window.location.href = 'thanks.html'; 
				
				} else if (q.m == "n") {
					modal = {
						icon: "meh",
						title: "Please Login",
						message: "Sorry<br>You need to login first!"
					}

				} else if (q.m == "e") {
					modal = {
						icon: "meh",
						title: "Don't Screw Around",
						message: "Sorry<br>Please don't screw around our API, We didn't have enough time to stress test it!"
					}
				}

				if (modal) {
					modal_host.replaceWith(
						base_modal.render(modal))

					modal = $(".ui.basic.modal")
					modal.modal({ closable: false })
					modal.modal('show')
				}
			}

		})
}

/* sync the local roll view */
var sync_roll_view = function() {

	alan.query("/me", {},
		function(me) {
			if (!me.e)
				
				/* if no one is logged */
				$("#roll").text(me.m)
		}) 

}

/* set timer */
var pad = function(s) {
	return ("00"+s).slice(-2)
}

var make_timer = function(secs) {

	alan.query("/since", {}, function(t) {
		
		till = parseInt(t.m + secs, 10)
		remain = till - Math.floor(Date.now()/1000)
		timerIntrvl = setInterval(function() {
			mins = parseInt(remain/60, 10)
			secs = remain - (mins*60)
			remain -= 1

			if (remain < -1 && t.m != -1) {
				window.location.href = "thanks.html"
				clearInterval(timerIntrvl)
			} else
				timer.text(pad(mins)+":"+pad(secs))
		
		}, 1000)
	})

}

/* on doc load */
$(function() {

	/* load all of em */
	already_sub_msg = $("#already-submitted-msg");
	opt_a = $("#opt-a"); opt_b = $("#opt-b"); 
	opt_c = $("#opt-c"); opt_d = $("#opt-d");
	base_modal = Template.from("basic-modal")
	submission_modal = $("#sub-modal")
	modal_host = $("#modal-host")
	timer = $("#time-remaining")
	all_q_pills = $(".q-pill")
	all_opts = $(".optn")
	q_host = $("#q")

	/* make the modal */
	submission_modal.modal({
		closable: true,
		onHidden: function() {
			loadQuestion(next_q_qno)
		}
	})

	/* hook callback */
	all_opts.on('click', function(elm) {
		he_chose = elm.target.innerText

		/* submit away answer */
		alan.query("/submit/"+global_qno, {
			"a": he_chose
		}, function(r) {

			/* let the man know that he already answered it */
			if (r.e) {
				if (r.m == "l") {
					modal = {
						icon: "meh",
						title: "Already Answered!",
						message: "Sorry<br/>You cannot edit an answer once you made a successful submission!"
					}

					modal_host.replaceWith(
							base_modal.render(modal))
					$(".ui.basic.modal").modal('show')
				}
			} else {
				already_answered.push(global_qno)
				if (global_qno <= 19)
					next_q_qno = global_qno + 1
				else
					next_q_qno = 20

				submission_modal.modal('show')
			}

		})

	})

	/* hook q-pill bar */
	$(".q-pill").on('click', function(elm) {
		val = $(elm.target).text()
		loadQuestion(parseInt(val, 10))
	})

	/* load roll */
	sync_roll_view()

	/* start timer */
	make_timer(1200)

	/* reload bar and remake */
	reloadQPillBar()

	/* load quest */
	loadQuestion(1)

})
