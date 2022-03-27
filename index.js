let { WebhookClient, MessageEmbed } = require("discord.js");
let express = require("express");
let app = express();
let mongoose = require("mongoose");
let { Webhook } = require("@top-gg/sdk");
let User = require("./models/User");
require("dotenv").config();
let fetch = require("node-fetch");

let voteHook = new Webhook(process.env.VOTE_SECRET);
let webhookVote = new WebhookClient({token: process.env.WH_TOKEN, id: process.env.WH_ID})

app.get("/", (req, res) => {
  res.send("Nothing to see here.");
});

app.get("/topgg", (req, res) => {
  res.send("Nothing to see here.");
});

app.post(
  "/topgg",
  voteHook.listener(async (vote) => {
    let votedUser = await fetch(
      `https://discord.com/api/v9/users/${vote.user}`,
      {
        headers: {
          Authorization: `Bot ${process.env.TOKEN}`,
        },
      }
    ).then((res) => res.json());

    let userV = await User.findOne({
      id: vote.user,
    });

    if (!userV) {
      await User.create({
        id: vote.user,
        votes: 1,
        lastVoted: Date.now(),
      });

      userV = await User.findOne({
        id: vote.user,
      });
    }

    const vote_number = userV.votes + 1 || 1;
    const embed = new MessageEmbed()
      .setAuthor({name:`${process.env.BOT_NAME}`, iconURL: `${process.env.BOT_AVATAR}`})
      .setColor("GREEN")
      .setTitle(`Vote! :D`)
      .setDescription(
        `**${votedUser.username}#${votedUser.discriminator}** (${votedUser.id}) voted for **${process.env.BOT_NAME}** on top.gg!`
      )
      .setFooter({text: `Vote #${vote_number}`});

    webhookVote.send({embeds: [embed]});

    return await userV.updateOne({
      votes: vote_number,
      lastVoted: Date.now(),
    });
  })
);

app.post("/dbl", async (req, res) => {
  if (req.headers.authorization !== process.env.VOTE_SECRET) return;
  let votedUser = await fetch(
    `https://discord.com/api/v9/users/${req.id}`,
    {
      headers: {
        Authorization: `Bot ${process.env.TOKEN}`,
      },
    }
  ).then((res) => res.json());

  let userV = await User.findOne({
    id: req.id,
  });

  if (!userV) {
    await User.create({
      id: req.id,
      votes: 1,
      lastVoted: Date.now(),
    });

    userV = await User.findOne({
      id: req.id,
    });
  }

  const vote_number = userV.votes + 1 || 1;
  const embed = new MessageEmbed()
      .setAuthor({name:`${process.env.BOT_NAME}`, iconURL: `${process.env.BOT_AVATAR}`})
      .setColor("GREEN")
      .setTitle(`Vote! :D`)
      .setDescription(
        `**${votedUser.username}#${votedUser.discriminator}** (${votedUser.id}) voted for **${process.env.BOT_NAME}** on top.gg!`
      )
      .setFooter({text: `Vote #${vote_number}`});
  webhookVote.send({embeds: [embed]});

  return await userV.updateOne({
    votes: vote_number,
    lastVoted: Date.now(),
  });
});

app.listen(80, () => {

    console.log(`Running Vote System on Port 80`);

    mongoose.connect(process.env.MONGO_URI).catch((err) => {
        console.log(err)
    });
});
