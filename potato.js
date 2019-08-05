// Import the discord.js module
const Discord = require('discord.js');
//const config = require('./auth.json');

// Create an instance of a Discord client
const client = new Discord.Client();

// Functions
const giveReaction = async (message, amount, reactionsArray) => {
    await message.channel.messages.fetch({ limit: 2 })
          .then(messages => {
            let mArray = messages.array();
            while (amount !== 0) {
              let random = Math.floor(Math.random() * reactionsArray.length);
              mArray[mArray.length - 1].react(reactionsArray[random]);
              amount--;
            }
            })
          .catch(error => console.log(`Couldn't fetch messages because of: ${error}`));
          message.delete();
}

const bDaysData = [
  {name: 'wizjer', day: new Date('June 30'), cheered: 0},
  {name: 'sabrus', day: new Date('October 31'), cheered: 0},
  {name: 'Alex Lather', day: new Date('February 14'), cheered: 0},
  {name: 'Emberiza', day: new Date('April 28'), cheered: 0},
  {name: 'Miraks', day: new Date('July 31'), cheered: 0},
  {name: 'Potato-bot', day: new Date('July 11'), cheered: 0}
]

function checkCheers() {
  bDaysData.forEach(bDayData => {
    if ((bDayData.day.getMonth() < new Date().getMonth()) || (bDayData.day.getMonth() == new Date().getMonth() && bDayData.day.getDate() < new Date().getDate())) {
      bDayData.cheered = 1;
    }
  });
}

function setActivity() {  
  const activitiesArray = [
    {type: 'WATCHING', movies: ['Игру престолов', 'Матрицу', 'сны', 'как кэп работает', 'белорусское кино']},
    {type: 'PLAYING', movies: ['Cyberpunk 2077', 'Mass Effect', 'Deus Ex', 'шахматы', 'Ферму VK']},
    {type: 'LISTENING', movies: ['музяку', 'чей-то плейлист', 'Dragon Age OST', 'Nina Simone', 'мотивационные подкасты']}
  ]
  const randomActivity = Math.floor(Math.random() * activitiesArray.length);
  
  client.user.setActivity(activitiesArray[randomActivity].movies[Math.floor(Math.random() * activitiesArray[randomActivity].movies.length)], { type: activitiesArray[randomActivity].type })
    .then(presence => console.log(`Activity set to ${presence.activity.name}`))
    .catch(console.error);  
}

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
  checkCheers();
  setActivity();  
  //console.log(client);
});


// Create an event listener for messages
client.on('message', async message => {
  
  let today = new Date(message.createdTimestamp);
  bDaysData.forEach(bDayData => {
    if (bDayData.day.getMonth() === today.getMonth() && bDayData.day.getDate() === today.getDate() && !bDayData.cheered) {

      // checking if bot restarted in the last 2 hours to prevent spam
      if (client.uptime < 2 * 60 * 60 * 1000 ) return;

      if (bDayData.name !== 'Potato-bot') {
        message.channel.send(`Сегодня (по моим необъяснимым часам) день рождения ${bDayData.name}! Поздравляю от лица всех роботов и картофелин, и желаю, чтобы твой органический процессор никогда не перегревался, а блюда из картошьки всегда были вкусненькими :3 (извините, я могу поздравить несколько раз, я пока не очень умненький)`);            
      } else {
        message.channel.send(`А у меня сегодня день рождения :3`);
      }
      bDayData.cheered = 1;
    }
  });
  
  //COMMANDS
  if (message.content.toLowerCase() === '!help') {
    message.channel.send(`!bot — Ich bin Kartoffel
!love — Удаляет сообщение с командой, к сообщению выше ставит 3 случайных смайлика с сердечками
!outrage — -//- с недовольными мордами
!cry — -//- со слезами
!omg — -//- с удивленными лицами
!lol — -//- с бугагашками
!ping — посчитает пинг. Не знаю зачем, прост
!count [слово] — посчитает использование слова на всех каналах (ееее)
!gif [запрос] — постит гифку по запросу (иногда медленно)
кто молодец? — скажет, что спросивший молодец
кто хороший мальчик? — скажет, что он`);
  }   
  
  if (message.content.toLowerCase() === '!bot' && !message.author.bot) {
    message.channel.send('Ich bin Kartoffel');
  }
  
  if (message.content.toLowerCase() === '!love' && !message.author.bot) {
    giveReaction(message, 3, ['😍', '😘', '😍', '😘', '💖', '💕', '❤', '💜', '😻', '😽']);
  }   
  
  if (message.content.toLowerCase() === '!outrage' && !message.author.bot) {
    giveReaction(message, 3, ['👿', '😡', '👺', '😤', '😠', message.guild.emojis.get('572080324981293066'), message.guild.emojis.get('575710002187206686')]);
  }
  
  if (message.content.toLowerCase() === '!cry' && !message.author.bot) {
    giveReaction(message, 3, ['😟', '😨', '😰', '😥', '😢', '😭', '😖', '😣', '😞']);
  }

  if (message.content.toLowerCase() === '!omg' && !message.author.bot) {
    giveReaction(message, 3, ['🙀', '🙈', '😱', '😮', '😯', message.guild.emojis.get('572080651704991771'), message.guild.emojis.get('575702079373443099'), message.guild.emojis.get('600204266170220545')]);
  }
  
  if (message.content.toLowerCase() === '!lol' && !message.author.bot) {
    giveReaction(message, 3, ['😃', '😄', '😁', '😆', '😅', '😂']);
  }  
   
  if(message.content.toLowerCase() === "!ping" && !message.author.bot) {
    const m = await message.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. Client latency is ${client.ws.ping}ms.`);
  }  
    
  if (message.content.toLowerCase().includes('!count') && !message.author.bot) {
    const sought = message.content.substring(message.content.indexOf('!count') + 6).trim().toLowerCase();
    
    const fetchAll = async (channel) => {
      let fetchinPromise = new Promise(async (resolve, reject) => {

        const fetchedMessages = [];  
        let fetchingLimit = 99;
        let fetchingBefore = channel.lastMessageID;

        while (fetchingLimit == 99) {
          await channel.messages.fetch({ limit: fetchingLimit, before: fetchingBefore})
            .then(messages => {
              messages.each(singleMessage => fetchedMessages.push(singleMessage.content));
              fetchingBefore = messages.last().id;
              if (messages.array().length < fetchingLimit) {
                fetchingLimit = messages.array().length;
                resolve({array: fetchedMessages, lookinFor: sought, channelName: channel.name});
              }
            })
            .catch(error => {
              console.log(`Couldn't fetch messages because of: ${error}`)
              reject(error);
            }); 
        }      
      });

      fetchinPromise
        .then(
          result => {
            let counted = result.array.filter(singleMessage => singleMessage.toLowerCase().includes(result.lookinFor));
            message.channel.send(`Искал слово ${result.lookinFor} среди ${result.array.length} сообщений на канале #${result.channelName}, нашёл совпадений: ${counted.length}`);
          },
          error => console.log(`Rejected because of: ` + error)
        )
    }
    
    message.client.channels.each(singleChannel => {
      if (singleChannel.type == 'text') {
       fetchAll(singleChannel);   
      }
    });    
  }
  
  if (message.content.toLowerCase().includes('!gif') && !message.author.bot) {
    const param = {
      url: 'api.giphy.com/v1/gifs/search',
      apiKey: 'ATdqioLenb44FbYJc88LmlBShmX1F1Bw',
      requested: message.content.substring(message.content.indexOf('!gif') + 4).trim().toLowerCase(),
      limit: 5,
      rating: 'G'
    }
    
    const rp = require('request-promise');
    rp(`https://${param.url}?api_key=${param.apiKey}&q=${param.requested}&limit=${param.limit}&offset=0&rating=${param.rating}&lang=en`)
    .then(data => {
        try {
          let parsedData = JSON.parse(data);
          let random = Math.floor(Math.random() * parsedData.data.length);
          console.log(random);
          
          if (parsedData.data[random].images.original.size < 8388000) {
            message.channel.send({
              files: [`${parsedData.data[random].images.original.url}?size=${parsedData.data[random].images.original.width}`]
            })
              .then(console.log(`Posted a gif for "${param.requested}" request`))
              .catch(console.error);          
          } else {
            message.channel.send({
              files: [`${parsedData.data[random].images.downsized.url}?size=${parsedData.data[random].images.downsized.width}`]
            })
              .then(console.log(`Posted a gif for "${param.requested}" request`))
              .catch(console.error);          
            }
        }
        catch(err) {
          console.log(err);
          message.channel.send('Не могу, что-то пошло не так :(');
        }
    })
    .catch(err => {
        console.log(err);
        message.channel.send('Не могу, что-то пошло не так :(');
    });

    
  }
  
  //CHATTING & REACTING
  if (message.content.length >= 150 && Math.floor(Math.random() * 3) == 1 && !message.author.bot) {    
    let answersArray = ['Хорошо сказано', 'Дело говоришь', 'Вот да', 'Поддерживаю', 'Точно-точно'];
    let answersRandom = Math.floor(Math.random() * answersArray.length);    
    message.channel.send(`${answersArray[answersRandom]}, ${message.author.username}!`);
  }
  
  if (!message.author.bot 
      &&
      (message.content.toLowerCase().includes('картох') || message.content.toLowerCase().includes('картоф') || message.content.toLowerCase().includes('бот') || message.content.toLowerCase().includes('картопл'))
      &&
      (message.content.toLowerCase().includes('спасиб') || message.content.toLowerCase().includes('милый') || message.content.toLowerCase().includes('ты ж моя'))
     ) {
    let answersArray = ['Всегда рад 😊', 'Всегда пожалуйста 😇', 'Aww 😻'];
    let answersRandom = Math.floor(Math.random() * answersArray.length);    
    message.channel.send(answersArray[answersRandom]);
  }    
  
  if (message.content.toLowerCase().includes('кто молодец?') && !message.author.bot) {
    message.channel.send(`Ты молодец, <@${message.author.id}>!`);
    message.react('😍')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }
  
  if (message.content.toLowerCase().includes('кто хороший мальчик') && !message.author.bot) {
    message.channel.send(`Я хороший мальчик! 😊`);
    message.react('😊')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }
  
  if (message.content.toLowerCase().includes('кофе') || message.content.toLowerCase().includes('спать хо') || message.content.toLowerCase().includes('хочу спать') || message.content.toLowerCase().includes('хочется спат') || message.content.toLowerCase().includes('утро') || message.content.toLowerCase().includes('утра') || message.content.toLowerCase() === 'утр') {
        
    let foodArray = ['🥐', '🧀', '🥞', '🍳', '🍰', '🍩'];
    let foodRandom = Math.floor(Math.random() * 6);   
    console.log(foodRandom);
    
    let coffeeArray = ['☕', '🍵', '🥛'];
    let coffeeRandom = Math.floor(Math.random() * 3); 
    console.log(coffeeRandom);
    
    message.react(foodArray[foodRandom])
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);    
    
    message.react(coffeeArray[coffeeRandom])
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }
  
  if (message.content.toLowerCase().includes('картофел') || message.content.toLowerCase().includes('картошк') || message.content.toLowerCase().includes('картопл') || message.content.toLowerCase().includes('картофан') || message.content.toLowerCase().includes('картох') || message.content.toLowerCase().includes('potato')) {
    message.react('🥔')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }   
  
  if (message.content.toLowerCase().includes('пицц')) {
    message.react('🍕')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }   
    
  if (message.content.toLowerCase().includes('пиу')) {
    message.channel.send('Вжух!');
  }
});

// Log our bot in 
client.login(process.env.BOT_TOKEN);
//client.login(config.token);