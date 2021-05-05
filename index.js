const Discord = require('discord.js');
const client = new Discord.Client();
const DisTube = require('distube');
const distube = new DisTube(client, { searchSongs: false, emitNewSongOnly: true });
const prefix = '-';
require('dotenv').config();

client.on("ready", () => {
    console.log(`${client.user.tag} Is Now Online :)`)
})

client.on("message", async (message) => {

    const error1Embed = new Discord.MessageEmbed()
        .setTitle('**💬 You Must Say A Title Or URL Of A Music To Play A Song 💬 \nExample : k!play https://www.youtube.com/watch?v=taYxyE34jjY**')
        .setColor('#00ffab')

    const error2Embed = new Discord.MessageEmbed()
        .setTitle('**🎶 You Must Be In A Voice Channel To Play A Song 🎶**')
        .setColor('#00ffab')

    const error3Embed = new Discord.MessageEmbed()
        .setTitle('**🚫 You Must Be In A Voice Channel To Stop The Song 🚫**')
        .setColor('#00ffab')

    const error4Embed = new Discord.MessageEmbed()
        .setTitle('**👯‍♂️ The Bot Is Not In The Voice Channel 👯‍♂️**')
        .setColor('#00ffab')

    const succesEmbed = new Discord.MessageEmbed()
        .setTitle('**🚫 You Disconnected The Bot 🚫**')
        .setColor('#00ffab')

    const SkipEmbed = new Discord.MessageEmbed()
        .setTitle('**⏭*Skipped*👍**')
        .setColor('#00ffab')
   

    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift();

    if (command == "play") {
        if (!message.member.voice.channel) return message.channel.send(error2Embed)
        if (!args[0]) return message.channel.send(error1Embed)
        distube.play(message, args.join(" "))
    }

    if (command == "disconnect") {
        const bot = message.guild.members.cache.get(client.user.id)
        if (!message.member.voice.channel) return message.channel.send(error3Embed)
        if (bot.voice.channel !== message.member.voice.channel) return message.channel.send(error4Embed)
        distube.stop(message)
        message.channel.send(succesEmbed)
    }

    if (command == "skip") {
        distube.skip(message)
        message.channel.send(SkipEmbed)
    }

    if (["loop", "repeat"].includes(command)) {
        let mode = distube.setRepeatMode(message, parseInt(args[0]));
        mode = mode ? mode == 2 ? "** Repeat Queue **" : "Repeat Song" : "Off";
        message.channel.send("** Set Repeat Mode To **`" + mode + " `");
    }

    if (command == "queue") {
        let queue = distube.getQueue(message);
        message.channel.send('** Current Queue: **\n' + queue.songs.map((song, id) =>
            `**${id + 1}**. [${song.name}](${song.url}) - \`${song.formattedDuration}\``
        ).join("\n"))
    }
});



const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode == 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

distube
    .on("playSong", (message, queue, song) => message.channel.send(
        `**🔍Searching🔎 \n🎶 Playing\`${song.name}\` - \`${song.formattedDuration}\`\nRequested By : ${song.user.tag}\n${status(queue)}🎶**`
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        `*📜Added ${song.name} - \`${song.formattedDuration}\` To The Queue By ${song.user.tag}📜 **`
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        `**🎶Play \`${playlist.name}\` Playlist (${playlist.songs.length} songs).\nRequested By : ${song.user.tag}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}🎶**`
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        `**👯‍♂️Added \`${playlist.name}\` Playlist (${playlist.songs.length} Songs) To Queue\n${status(queue)}👯‍♂️**`
    ))

    .on("SearchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**✋ Choose An Option From Below **\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*⌚ Enter Anything Else Or Wait 60 Seconds To Cancel ❌**`);
    })

    .on("SearchCancel", (message) => message.channel.send(`**❌🔍 Searching Canceled 🔎❌**`))
    .on("error", (message, e) => {
        console.error(e)
        message.channel.send("An error encountered : " + e);
    });
    client.login(process.env.TOKEN);