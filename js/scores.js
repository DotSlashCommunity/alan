/*
	@author ksdme
	scoreboard refresher
*/

/* do you love globals ? */
var details_cache = undefined;
scores_host = $("#scores-host");
score_view = Template.from("score-list-view")

/* alan is a great guy */
alan = AlanServer.from(SERVER)

var update_scoreboard = function() {
	scores_host.html("")

	alan.query("/scores", {},
		function(scores) {
			console.log(scores)
			template_amal = ""
			current_rank = 000
			current_score = 500

			for(score in scores.list) {
				score = scores.list[score]

				if (score[1] < current_score) {
					current_score = score[1]
					current_rank += 1
				}

				guys_name = details_cache[score[0]]
				if (!guys_name) {
					alan.query("/details", {},
						function(details){
							details_cache = details
							update_scoreboard()
						})
				}

				template_amal += score_view.render({
					"index": current_rank,
					"content": score[0],
					"title": guys_name,
				})
			}

			scores_host.html(template_amal)
		})
}

/* on doc load */
$(function() {
	alan.query("/details", {},
		function(details){
			details_cache = details

			/* fire the start */
			update_scoreboard()

			/* timeout now and then */
			setTimeout(function() {
				update_scoreboard()
			}, 5000)
		})
})
