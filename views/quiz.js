const question = document.querySelector('#question');
const choices = Array.from(document.querySelectorAll('.choice-text'));
const progressText = document.querySelector('#progressText');
const scoreText = document.querySelector('#score');
const progressBarFull = document.querySelector('#progressBarFull');

let currentQuestion = {}
let acceptingAnswers = true
let score = 0
let questionCounter = 0
let availableQuestions = []

// subscription key and region for speech services.
const subscriptionKey = '';   //change me
const serviceRegion = '';    //change me
var SpeechSDK;
var recognizer;


$.get('/datidb', function(data){

  const MAX_QUESTIONS = 10

  var questionsIndex = 0

  startQuiz = () =>{
      questionCounter = 0
      score = 0
      availableQuestions = [...data]
      getNewQuestion()
  }

  getNewQuestion = () => {
      if(availableQuestions.length === 0 || questionCounter >= MAX_QUESTIONS){
          localStorage.setItem('mostRecentScore', score)

          return window.location.assign('/end.html')
      }
      
      //incrementa contatore domande
      questionCounter++

      //div in alto a sinistra percentuale completamento domande
      progressText.innerText = `Domanda ${questionCounter} di ${MAX_QUESTIONS}`
      progressBarFull.style.width = `${(questionCounter/MAX_QUESTIONS) * 100}%`

      //questionsIndex++;

      //sceglie prossima domanda 
      currentQuestion = availableQuestions[questionsIndex]
      question.innerText = currentQuestion

      //rimuove dall'array 
      availableQuestions.splice(questionsIndex, 1)

      acceptingAnswers = true
  }

  //registra 
  let rec = document.querySelector('.rec');
  rec.addEventListener('click', function(){
      //rec.disabled = true;
      verify.disabled = true;

      //creo servizio voce con key e region
      var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
      var prova = currentQuestion;
      

      var pronunciationAssessmentConfig = new SpeechSDK.PronunciationAssessmentConfig(prova, true);
        
          //lingua inglese
          speechConfig.speechRecognitionLanguage = "en-US";

          //fonte input audio
          var audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();
          recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

          pronunciationAssessmentConfig.applyTo(recognizer);

          recognizer.recognizeOnceAsync(
              function (result) {
                rec.disabled = true;

                parsedJSON = JSON.parse(result.json);
                punteggio = Math.floor(parseInt(JSON.stringify(parsedJSON.NBest[0].PronunciationAssessment.AccuracyScore)) +
                parseInt(JSON.stringify(parsedJSON.NBest[0].PronunciationAssessment.FluencyScore)) + 
                parseInt(JSON.stringify(parsedJSON.NBest[0].PronunciationAssessment.CompletenessScore)) +
                parseInt(JSON.stringify(parsedJSON.NBest[0].PronunciationAssessment.PronScore)));
                incrementScore(punteggio)

                alert("Confidence: " + parsedJSON.NBest[0].Confidence + "\n" +
                  "Accuratezza: "+ parsedJSON.NBest[0].PronunciationAssessment.AccuracyScore + "\n" +
                  "Scioltezza: " + parsedJSON.NBest[0].PronunciationAssessment.FluencyScore + "\n" +
                  "Completezza: " + parsedJSON.NBest[0].PronunciationAssessment.CompletenessScore + "\n" +
                  "Pronuncia: " + parsedJSON.NBest[0].PronunciationAssessment.PronScore);
    
                recognizer.close();
                recognizer = undefined;
                verify.disabled = false;
                document.querySelector(".next").style.visibility = "visible";
              },
              function (err) {
                rec.disabled = false;
                window.console.log(err);
    
                recognizer.close();
                recognizer = undefined;
              });

  });

  //bottone prossima domanda
  let next = document.querySelector('.next');
  next.addEventListener('click', function(){
      getNewQuestion();
      document.querySelector(".next").style.visibility = "hidden";
      rec.disabled = false;
      verify.disabled = false;
  });

  //bottone suggerimento pronuncia
  let verify = document.querySelector(".verify");
  verify.addEventListener('click', function(){


      //creo servizio voce con key e region
      var speechConfig = SpeechSDK.SpeechConfig.fromSubscription(subscriptionKey, serviceRegion);
      synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig);

      let inputText = currentQuestion

      synthesizer.speakTextAsync(
          inputText,
          function (result) {
            startSpeakTextAsyncButton.disabled = false;
            if (result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
              resultDiv.innerHTML += "synthesis finished for [" + inputText + "].\n";
            } else if (result.reason === SpeechSDK.ResultReason.Canceled) {
              resultDiv.innerHTML += "synthesis failed. Error detail: " + result.errorDetails + "\n";
            }
            window.console.log(result);
            synthesizer.close();
            synthesizer = undefined;
          },
          function (err) {
            startSpeakTextAsyncButton.disabled = false;
            resultDiv.innerHTML += "Error: ";
            resultDiv.innerHTML += err;
            resultDiv.innerHTML += "\n";
            window.console.log(err);

            synthesizer.close();
            synthesizer = undefined;
        });

  });

  //bottone per tornare alla home
  let home = document.querySelector(".home");
  home.addEventListener('click', function(){
      //getNewQuestion();
      location.href = "/index.html";
  });

  //bottone per tradurre frase
  // let translate = document.querySelector('.translate');
  // translate.addEventListener('click', function(){
  //   fetch('/translate', {
  //     method: 'POST',
  //       headers: {
  //           'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //           currentQuestion,
  //       }),
  //   })
  //       .then((res) => {
  //           return res.json();
  //       })
  //       .then((data) => console.log(data));
  //   });


  //incrementa lo score 
  incrementScore = num => {
      score += num
      scoreText.innerText = score
  }

  startQuiz()
});


