const timeout = async ms => new Promise(res => setTimeout(res, ms));


let next = false; // this is to be changed on user input
let clicks = 0;

//const { Octokit } = require("@octokit/rest");


async function waitUserInput() {

  while (next === false) await timeout(50); // pause script but avoid browser to freeze ;)
  next = false; // reset var
  console.log('user input detected');
}

async function myFunc() {
  // do stuff
  while (true) {
    await waitUserInput();
		$('#text').append('...<br>');
		await timeout(1000);
    $('#text').append('* User has clicked ' + ++clicks + ' times. <br>');
   
}}

$('#user-input').click(() => next = true)

myFunc();