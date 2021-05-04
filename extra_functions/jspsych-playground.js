/**
 * jspsych-serial-reaction-time
 * Josh de Leeuw
 *
 * plugin for running a serial reaction time task
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["playground"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'playground',
    description: '',
    parameters: {
    //   target: {
    //     type: jsPsych.plugins.parameterType.INT,
    //     pretty_name: 'Target',
    //     array: true,
    //     default: undefined,
    //     description: 'The location of the target. The array should be the [row, column] of the target.'
    //   },
    //   grid: {
    //     type: jsPsych.plugins.parameterType.BOOL,
    //     pretty_name: 'Grid',
    //     array: true,
    //     default: [[1,1,1,1]],
    //     description: 'This array represents the grid of boxes shown on the screen.'
    //   },
    //   grid_square_size: {
    //     type: jsPsych.plugins.parameterType.INT,
    //     pretty_name: 'Grid square size',
    //     default: 100,
    //     description: 'The width and height in pixels of each square in the grid.'
    //   },
    //   target_color: {
    //     type: jsPsych.plugins.parameterType.STRING,
    //     pretty_name: 'Target color',
    //     default: "#999",
    //     description: 'The color of the target square.'
    //   },
    //   response_ends_trial: {
    //     type: jsPsych.plugins.parameterType.BOOL,
    //     pretty_name: 'Response ends trial',
    //     default: true,
    //     description: 'If true, the trial ends after a mouse click.'
    //   },
    //   pre_target_duration: {
    //     type: jsPsych.plugins.parameterType.INT,
    //     pretty_name: 'Pre-target duration',
    //     default: 0,
    //     description: 'The number of milliseconds to display the grid before the target changes color.'
    //   },
    //   trial_duration: {
    //     type: jsPsych.plugins.parameterType.INT,
    //     pretty_name: 'Trial duration',
    //     default: null,
    //     description: 'How long to show the trial'
    //   },
    //   fade_duration: {
    //     type: jsPsych.plugins.parameterType.INT,
    //     pretty_name: 'Fade duration',
    //     default: null,
    //     description: 'If a positive number, the target will progressively change color at the start of the trial, with the transition lasting this many milliseconds.'
    //   },
    //   allow_nontarget_responses: {
    //     type: jsPsych.plugins.parameterType.BOOL,
    //     pretty_name: 'Allow nontarget response',
    //     default: false,
    //     description: 'If true, then user can make nontarget response.'
    //   },
      prompt_question: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus'
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      stimulus_idx: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus index',
        default: null,
        description: 'Index of the paired-associate'
      },      
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      condition: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Experimental Condition',
        default: null,
        description: 'Name of the schema condition for this trial'
      },  
      stage: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Experimental Stage',
        default: null,
        description: 'Schema learning or New PA learning'
      },       
      coords: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Coordinates',
        array: true,
        default: null,
        description: 'This array contains row column coordinates for the image.'
      },               
    }
  }

  plugin.trial = function(display_element, trial) {

    /////////////////////////////////////////////////////////////////////////////////////////////
    var timeout = true
    var startTime = -1;
    var response = {
      rt: null,
      row: null,
      col: null,
      correct: null, //null if missed, else true/false
    }
    debugger

    // if its schema learning, then define a string like 'ses1' 'ses2' etc, to access img coords. Else if its new pa learning, then define a string 'new_pa'
    let curr_session = jatos.studySessionData.inputData.condition_ses_counters[trial.condition][trial.stage]
    let img_array    = jatos.studySessionData.inputData.stimuli[trial.condition][trial.stage]

    // Create the board
    grid_box = board_creator(400,
      jatos.studySessionData.inputData.n_rows,
      jatos.studySessionData.inputData.n_cols,
      jatos.studySessionData.inputData.condition_colors[trial.condition],
      false,
      img_array,
      jatos.studySessionData.inputData.condition_coords[trial.condition][trial.stage]['ses' + curr_session])

    //Add mouseclick listener MUST EDIT

    var all_cells = grid_box.querySelectorAll('.cells')

    for (iC=0; iC<all_cells.length; iC++){
      // console.log(iC)
      all_cells[iC].addEventListener('click',getResponse)
    }

    display_element.appendChild(grid_box)
    // debugger
		
    //show prompt_question with the trial counter
    let iTrial = jsPsych.data.get().values().length + 1
    display_element.insertAdjacentHTML('beforeend', trial.prompt_question += ' Trial ' + iTrial);

		//show stimulus
    let stimulus_element = document.createElement('img')
    stimulus_element.className = 'prompt_stimulus'
    stimulus_element.style.width = trial.stimulus_width
    stimulus_element.src = trial.stimulus
    stimulus_element.style.display = 'block'
    stimulus_element.style.margin = 'auto'

    display_element.appendChild(stimulus_element);    

    // Add an empty feedback element
    let feedback_el = document.createElement('P')
    feedback_el.innerText = 'null'
    feedback_el.id = 'feedback_text'
    feedback_el.style.visibility = 'hidden'

    display_element.appendChild(feedback_el)

    startTime = performance.now();

    // if(trial.trial_duration !== null){
      jsPsych.pluginAPI.setTimeout(function(){doFeedback(null,timeout)}, jatos.studySessionData.inputData.trial_duration);
    // }

    function getResponse(e){
      info = {}

      info.rt = performance.now() - startTime

      let curr_row_col = e.currentTarget.id.split('_')
      info.row = parseInt(curr_row_col[2],10)
      info.col = parseInt(curr_row_col[4],10)

      if (info.row == trial.coords[0] & info.col == trial.coords[1]){
        info.correct = true
      } else {
        info.correct = false
      }

      // only record first response
      response = response.rt == null ? info : response;
      
      timeout = false

      doFeedback(info.correct,timeout);

    }

    function doFeedback(correct, timeout) {
      console.log('doFB called!')
      // debugger

      // Remove all the event listeners from all the cells.
      document.querySelectorAll('.cells').forEach(function(el){
        el.removeEventListener('click',getResponse,false)
      })

      if (timeout) {
        feedback_text = 'You missed...'
        document.querySelector('#feedback_text').innerText = feedback_text
        document.querySelector('#feedback_text').style.visibility = 'visible'
      } else {

        correct == true ? feedback_text = 'Correct!' : feedback_text = 'Incorrect...'

        // show the feedback
        document.querySelector('#feedback_text').innerText = feedback_text
        document.querySelector('#feedback_text').style.visibility = 'visible'
      }

      // Show the true feedback!
      document.querySelector('#PA_'+trial.stimulus_idx).style.visibility = 'visible'

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      jsPsych.pluginAPI.setTimeout(function() {
        endTrial();
      }, jatos.studySessionData.inputData.feedback_duration);
    
    }


    function endTrial() {
      // console.log('Another trial');
      
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // debugger
      // gather the data to store for the trial
      var trial_data = response;

      // Add trial variables to the trial data
      trial_data.condition = trial.condition
      trial_data.stage = trial.stage
      trial_data.session = jatos.studySessionData.inputData.condition_ses_counters[trial.condition]
      trial_data.stimulus = trial.stimulus
      trial_data.corr_row = trial.coords[0]
      trial_data.corr_col = trial.coords[1]

      

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);

    };

  };

  return plugin;
})();
