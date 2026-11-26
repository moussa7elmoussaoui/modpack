const PERSONALITIES = [
  {
    id: "steady",
    turnSpeed: 12,
    reactionTicks: 3,
    aimTolerance: 5,
    lines: {
      greeting: ["Hey, what do you need?", "I'm ready when you are."],
      thanks: ["Anytime.", "Glad I could help."],
      generic: ["I'm here. What do you need?", "Give me an order whenever you're ready."],
      receivedSolo: ["On it. I'll {task}{location}.", "Got it. I'm going to {task}{location}."],
      receivedGroup: ["We'll {task}{location}.", "All right. We're going to {task}{location}."],
      completed: ["Done. {text}.", "Finished: {text}."],
      stuck: ["I'm stuck. {text}.", "I can't get past this: {text}."],
      hurt: ["That hit me. I'm watching for danger.", "I'm hurt. Give me a moment to recover."],
      injured: ["I'm badly hurt. I need to get somewhere safe.", "I'm in rough shape. I need a moment."],
      returned: ["Good to see you again.", "There you are. What do you need?"]
    }
  },
  {
    id: "cheerful",
    turnSpeed: 16,
    reactionTicks: 2,
    aimTolerance: 7,
    lines: {
      greeting: ["Hey! What are we doing?", "Hi! Ready for the next job."],
      thanks: ["Happy to help!", "Anytime, friend."],
      generic: ["I'm here and ready to help!", "What's next?"],
      receivedSolo: ["Sounds good! I'll {task}{location}.", "On it! I'll get {task}{location}."],
      receivedGroup: ["Let's do it. We'll {task}{location}.", "We're on it! We'll handle it{location}."],
      completed: ["All done! {text}.", "We got it done: {text}."],
      stuck: ["I hit a snag. {text}.", "I could use a hand here: {text}."],
      hurt: ["Ow! That caught me off guard.", "That stung. I'm keeping an eye out."],
      injured: ["I'm hurt pretty badly. I need to get safe.", "Could use a breather. I'm badly hurt."],
      returned: ["Hey, welcome back!", "There you are! Need anything?"]
    }
  },
  {
    id: "cautious",
    turnSpeed: 10,
    reactionTicks: 4,
    aimTolerance: 4,
    lines: {
      greeting: ["I'm here. What do you need?", "Ready. I'll keep an eye out."],
      thanks: ["Of course.", "No problem."],
      generic: ["I'm here if you need me.", "I'll wait for your order."],
      receivedSolo: ["Understood. I'll {task}{location}.", "I'll handle it carefully: {task}{location}."],
      receivedGroup: ["Understood. We'll {task}{location}.", "We'll go ahead and {task}{location}."],
      completed: ["It's done: {text}.", "Finished safely: {text}."],
      stuck: ["I can't make safe progress. {text}.", "I need help with this: {text}."],
      hurt: ["I'm hit. Checking what's nearby.", "That hurt. I'm looking for a safer spot."],
      injured: ["I'm badly hurt. I need to retreat.", "I need cover before I go on."],
      returned: ["You're back. I'll stay close.", "Good, you're here. What's next?"]
    }
  },
  {
    id: "bold",
    turnSpeed: 18,
    reactionTicks: 1,
    aimTolerance: 8,
    lines: {
      greeting: ["Ready. Point me at a job.", "What needs doing?"],
      thanks: ["You got it.", "Anytime. What's next?"],
      generic: ["I'm ready. Give me something to do.", "Standing by."],
      receivedSolo: ["I've got it. I'll {task}{location}.", "Leave it to me. I'll {task}{location}."],
      receivedGroup: ["We've got it. We'll {task}{location}.", "All right, we'll {task}{location}."],
      completed: ["Job done: {text}.", "Finished. What's next? {text}."],
      stuck: ["I'm blocked. {text}.", "This is holding me up: {text}."],
      hurt: ["I'm hit, but still standing.", "That one got through. I'm staying on it."],
      injured: ["I'm badly hurt. Pulling back for now.", "I need to recover before the next fight."],
      returned: ["Back already? Let's get moving.", "Good timing. What's the next job?"]
    }
  },
  {
    id: "thoughtful",
    turnSpeed: 14,
    reactionTicks: 3,
    aimTolerance: 6,
    lines: {
      greeting: ["Hey. What's the plan?", "I'm listening. What do you need?"],
      thanks: ["Glad that helped.", "You're welcome."],
      generic: ["I'm here. Let me know what you need.", "Ready when you are."],
      receivedSolo: ["All right. I'll {task}{location}.", "That makes sense. I'll {task}{location}."],
      receivedGroup: ["All right. We'll {task}{location}.", "We can {task}{location}."],
      completed: ["That's finished: {text}.", "Done. {text}."],
      stuck: ["I've run into a problem. {text}.", "I need another route. {text}."],
      hurt: ["I'm hit. I'll check my surroundings.", "That hurt. I should be more careful."],
      injured: ["I'm badly hurt. I should fall back.", "I need to recover somewhere safe."],
      returned: ["Welcome back. How did things go?", "Good to see you. What's next?"]
    }
  }
];

export function clonePersonality(slot) {
  const index = Number.isInteger(slot) && slot > 0 ? slot - 1 : 0;
  return PERSONALITIES[index % PERSONALITIES.length];
}

export function cloneLine(slot, kind, values = {}) {
  const options = clonePersonality(slot).lines[kind] ?? PERSONALITIES[0].lines.generic;
  const template = options[Math.floor(Math.random() * options.length)];
  return template.replace(/\{([a-z]+)\}/gi, (_match, key) => String(values[key] ?? ""));
}
