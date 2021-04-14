const tapeRecorderState = {
  record: false,
  play: false,
  rewind: false,
  fastForward: false,
  eject: false,
  pause: false,
  complete: false,
  songNumber: 0,
};
const mixTape = [];
const songPlayer = document.getElementById("song-player");
const tapeVideo = document.querySelector(".tape-video");
const tapeForwards = document.getElementById("tape-video-play");
const tapeBackwards = document.getElementById("tape-video-rewind");
const clickOnSound = new Audio("/sounds/button-click.mp3");
const clickOffSound = new Audio("/sounds/button-click-off.mp3");
const stopSound = new Audio("/sounds/stop-button.mp3");
const rewind = function () {
  animationPosition = tapeForwards.duration - tapeForwards.currentTime;
  tapeBackwards.currentTime = animationPosition;
  tapeForwards.pause();
  setTimeout(() => {
    $("#tape-video-rewind").addClass("tape-video");
    $("#tape-video-rewind").removeClass("tape-video-alt");
    $("#tape-video-play").addClass("tape-video-alt");
    $("#tape-video-play").removeClass("tape-video");
  }, 100);
  tapeBackwards.playbackRate = 3;
  tapeBackwards.play();
};
forwards = function () {
  animationPosition = tapeBackwards.duration - tapeBackwards.currentTime;
  tapeForwards.currentTime = animationPosition;
  tapeBackwards.pause();
  setTimeout(() => {
    $("#tape-video-play").addClass("tape-video");
    $("#tape-video-play").removeClass("tape-video-alt");
    $("#tape-video-rewind").addClass("tape-video-alt");
    $("#tape-video-rewind").removeClass("tape-video");
  }, 100);
  tapeForwards.playbackRate = 1;
};
let animationPosition;
let rewindStart;
let forwardStart;
let date;
let newTime;
let lastTime;
let rewindingID;
let forwardingID;
const recordTape = function () {
  // use upload element's click function
  if (!tapeRecorderState.record && !tapeRecorderState.complete) {
    $("#upload").click();
  }
};
const playTape = function () {
  if (
    tapeRecorderState.complete &&
    !tapeRecorderState.rewind &&
    !tapeRecorderState.fastForward &&
    !(
      tapeRecorderState.songNumber == mixTape.length - 1 &&
      songPlayer.currentTime == songPlayer.duration
    )
  ) {
    tapeRecorderState.play = true;
    $("#play").addClass("tape-recorder-button-pressed");
    clickOnSound.play();
    tapeVideo.play();
    songPlayer.play();
  }
};
const rewindTape = function () {
  if (
    tapeRecorderState.complete &&
    !tapeRecorderState.pause &&
    !tapeRecorderState.play &&
    !tapeRecorderState.fastForward
  ) {
    tapeRecorderState.rewind = true;
    // adjust visual elements
    $("#rewind").addClass("tape-recorder-button-pressed");
    clickOnSound.play();
    // change video to rewind
    rewind();
    // move song back
    date = new Date();
    rewindStart = date.getTime();
    lastTime = rewindStart;
    rewindingID = setInterval(() => {
      date = new Date();
      newTime = date.getTime();
      songPlayer.currentTime -= (3 * (newTime - lastTime)) / 1000;
      lastTime = newTime;
      if (songPlayer.currentTime <= 0 && tapeRecorderState.songNumber != 0) {
        tapeRecorderState.songNumber -= 1;
        songPlayer.src = mixTape[tapeRecorderState.songNumber];
        setTimeout(() => {
          songPlayer.currentTime = songPlayer.duration;
        }, 50);
      } else if (songPlayer.currentTime <= 0) {
        tapeRecorderState.rewind = false;
        forwards();
        songPlayer.pause();
        $("#rewind").removeClass("tape-recorder-button-pressed");
        clickOffSound.play();
        clearInterval(rewindingID);
      }
    }, 100);
  }
};
const fastForwardTape = function () {
  if (
    tapeRecorderState.complete &&
    !tapeRecorderState.pause &&
    !tapeRecorderState.play &&
    !tapeRecorderState.rewind
  ) {
    tapeRecorderState.fastForward = true;
    // adjust visual elements
    $("#fast-forward").addClass("tape-recorder-button-pressed");
    clickOnSound.play();
    // change video to fast forward
    tapeForwards.play();
    tapeForwards.playbackRate = 5;
    // move song forwards
    date = new Date();
    forwardStart = date.getTime();
    lastTime = forwardStart;
    forwardingID = setInterval(() => {
      date = new Date();
      newTime = date.getTime();
      songPlayer.currentTime += (5 * (newTime - lastTime)) / 1000;
      lastTime = newTime;
    }, 100);
  }
};
const ejectTape = function () {
  if (!tapeRecorderState.complete && !tapeRecorderState.record) {
    // end recording
    tapeRecorderState.complete = true;
    tapeRecorderState.songNumber = mixTape.length - 1;
    $("#eject").addClass("tape-recorder-button-pressed");
    stopSound.play();
    setTimeout(function () {
      $("#eject").removeClass("tape-recorder-button-pressed");
    }, 200);
  } else if (tapeRecorderState.play) {
    tapeRecorderState.play = false;
    tapeForwards.pause();
    $("#play").removeClass("tape-recorder-button-pressed");
    $("#eject").addClass("tape-recorder-button-pressed");
    stopSound.play();
    setTimeout(function () {
      $("#eject").removeClass("tape-recorder-button-pressed");
    }, 200);
    songPlayer.pause();
  } else if (tapeRecorderState.rewind) {
    tapeRecorderState.rewind = false;
    forwards();
    songPlayer.pause();
    $("#rewind").removeClass("tape-recorder-button-pressed");
    clearInterval(rewindingID);
    $("#eject").addClass("tape-recorder-button-pressed");
    stopSound.play();
    setTimeout(function () {
      $("#eject").removeClass("tape-recorder-button-pressed");
    }, 200);
  } else if (tapeRecorderState.fastForward) {
    tapeRecorderState.fastForward = false;
    tapeForwards.pause();
    tapeForwards.playbackRate = 1;
    songPlayer.pause();
    $("#fast-forward").removeClass("tape-recorder-button-pressed");
    clearInterval(forwardingID);
    $("#eject").addClass("tape-recorder-button-pressed");
    stopSound.play();
    setTimeout(function () {
      $("#eject").removeClass("tape-recorder-button-pressed");
    }, 200);
  }
};
const pauseTape = function () {
  if (tapeRecorderState.play && !tapeRecorderState.pause) {
    tapeRecorderState.pause = true;
    tapeForwards.pause();
    songPlayer.pause();
    $("#pause").addClass("tape-recorder-button-pressed");
    clickOnSound.play();
  } else if (tapeRecorderState.pause) {
    tapeRecorderState.pause = false;
    tapeForwards.play();
    songPlayer.play();
    $("#pause").removeClass("tape-recorder-button-pressed");
    clickOffSound.play();
  }
};
$("#upload").on("input", function () {
  // add the file to the mix tape array, and adjust visual elements
  mixTape.push(URL.createObjectURL(document.getElementById("upload").files[0]));
  songPlayer.src = mixTape[mixTape.length - 1];
  $("#record").addClass("tape-recorder-button-pressed");
  $("#play").addClass("tape-recorder-button-pressed");
  clickOnSound.play();
  tapeRecorderState.record = true;
  tapeForwards.play();
});
songPlayer.onended = function () {
  if (tapeRecorderState.record) {
    // adjust visual elements
    $("#record").removeClass("tape-recorder-button-pressed");
    $("#play").removeClass("tape-recorder-button-pressed");
    clickOffSound.play();
    tapeRecorderState.record = false;
    tapeRecorderState.play = false;
    tapeForwards.pause();
    songPlayer.pause();
  } else if (tapeRecorderState.play) {
    if (tapeRecorderState.songNumber < mixTape.length - 1) {
      tapeRecorderState.songNumber = tapeRecorderState.songNumber + 1;
      songPlayer.src = mixTape[tapeRecorderState.songNumber];
      songPlayer.play();
    } else {
      tapeRecorderState.play = false;
      tapeForwards.pause();
      $("#play").removeClass("tape-recorder-button-pressed");
      clickOffSound.play();
      songPlayer.pause();
    }
  } else if (tapeRecorderState.fastForward) {
    if (tapeRecorderState.songNumber < mixTape.length - 1) {
      tapeRecorderState.songNumber += 1;
      songPlayer.src = mixTape[tapeRecorderState.songNumber];
    } else {
      tapeRecorderState.fastForward = false;
      songPlayer.pause();
      tapeForwards.pause();
      tapeForwards.playbackRate = 1;
      $("#fast-forward").removeClass("tape-recorder-button-pressed");
      clickOffSound.play();
      clearInterval(forwardingID);
    }
  }
};
