// Import the discord.js module
const Discord = require('discord.js');
//const config = require('./auth.json');

// Create an instance of a Discord client
const client = new Discord.Client();

// Functions & Arrays
// Connection to Mongo DB
const knock_db = new Promise((resolve, reject) => {
  const MongoClient = require('mongodb').MongoClient;
  const uri = process.env.MONGO_URI;
  const mngClient = new MongoClient(uri, { useNewUrlParser: true });
  mngClient.connect((data, err) => {
    const pData = mngClient.db('potato_data');
    pData.collections((err, data) => {
      data.forEach(collection => console.log(collection.collectionName)); //выводит имена коллекций внутри базы потата-дата
      if (err) console.log(err);
    })
    const bDays = pData.collection('b_days'); //подтягивает коллекцию "b_days" и резолвит промис ею
    resolve(bDays); 
    if (err) reject(err);
  });  
})

function checkCheers() {
  knock_db
    .then(collection => {
      collection.find().toArray((err, items) => {
        items.forEach(item => {   
          if (new Date().getMonth() === '0' && (new Date().getDate() === '1' || new Date().getDate() === '2')) { //Хероку перезагружается каждые 24-27 часов, одни сутки могут выпасть
            collection.updateOne({name: item.name}, {'$set': {'cheered': false}}, (err, item) => {
              console.log('Начало года, информация о поздравлении сброшена', item);
            })            
          }
          
          if (item.cheered) {
            console.log(`${item.name} поздравлен`);
          }  
          
          if ((new Date(item.date).getMonth() === new Date().getMonth()) && (new Date(item.date).getDate() === new Date().getDate()) && !item.cheered) {
            if (item.name !== 'Potato-bot') {
              client.channels.fetch('382216359465058306')
                .then(channel => channel.send(`Сегодня (по моим необъяснимым часам) день рождения ${item.name}! Поздравляю от лица всех роботов и картофелин, и желаю, чтобы твой органический процессор никогда не перегревался, а блюда из картошьки всегда были вкусненькими :3`))
                .catch(console.error);                      
            } else {
              client.channels.fetch('382216359465058306')
                .then(channel => channel.send(`А у меня сегодня день рождения :3`))
                .catch(console.error);              
            }            
            collection.updateOne({name: item.name}, {'$set': {'cheered': true}}, (err, item) => {
              console.log('DB updated', item);
            })
          }          
        })
      })
    })
}

const botNames = ['картох', 'картоф', 'картопл', 'картошк', 'потат', 'potato', 'potata']

function checkName(str) {
  let clearedString = str.toLowerCase().trim().replace(/[^a-z0-9а-яё]/g, ' ').replace(/\s+/g,' ').split(' ');
  return clearedString.some(word => {return word == 'бот'});
}

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

function setActivity(type, activity, callback) { 
  if (type && activity) {
    client.user.setActivity(activity, {type: type})
      .then(presence => console.log(`Activity set to ${presence.activity.name} by request`))
      .catch(console.error);
  } else {
  const activitiesArray = [
    {type: 'WATCHING', list: ['Игру престолов', 'Матрицу', 'сны', 'как кэп работает', 'белорусское кино', 'спойлеры']},
    {type: 'PLAYING', list: ['Cyberpunk 2077', 'Mass Effect', 'Deus Ex', 'шахматы', 'Ферму VK', 'сапёра']},
    {type: 'LISTENING', list: ['музяку', 'чей-то плейлист', 'Dragon Age OST', 'Nina Simone', 'мотивационные подкасты', 'треск горящих жоп']}
  ]
  const randomActivity = Math.floor(Math.random() * activitiesArray.length);
  
  client.user.setActivity(activitiesArray[randomActivity].list[Math.floor(Math.random() * activitiesArray[randomActivity].list.length)], { type: activitiesArray[randomActivity].type })
    .then(presence => console.log(`Activity set to ${presence.activity.name}`))
    .catch(console.error);
  }
  if (callback) callback(type, activity);
}

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
  setActivity();  
  checkCheers(); 
  //console.log(client);
});


// Create an event listener for messages
client.on('message', async message => {
  
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
кто хороший мальчик? — скажет, что он
%bot_name% [прекрати / перестань / прекращай / хватит] — сменит статус
%bot_name% [поиграй / послушай / посмотри] [запрос] — сменит статус на запрошенный`);
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
  
  if (!message.author.bot && message.content.toLowerCase().includes('!gif')) {
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
  if (!message.author.bot && message.content.length >= 150 && Math.floor(Math.random() * 3) == 1) {    
    let answersArray = ['Хорошо сказано', 'Дело говоришь', 'Вот да', 'Поддерживаю', 'Точно-точно'];
    let answersRandom = Math.floor(Math.random() * answersArray.length);    
    message.channel.send(`${answersArray[answersRandom]}, ${message.author.username}!`);
  }
  
  if (!message.author.bot 
      &&
      (botNames.some(name => {return message.content.toLowerCase().includes(name)}) || checkName(message.content))
      &&
      (message.content.toLowerCase().includes('спасиб') || message.content.toLowerCase().includes('милый') || message.content.toLowerCase().includes('хороший') || message.content.toLowerCase().includes('умница') || message.content.toLowerCase().includes('молодец') || message.content.toLowerCase().includes('ты ж моя'))
     ) {
    let answersArray = ['Всегда рад 😊', 'Всегда пожалуйста 😇', 'Aww 😻', ':)'];
    let answersRandom = Math.floor(Math.random() * answersArray.length);    
    message.channel.send(answersArray[answersRandom]);
  }    
  
  if (!message.author.bot 
      &&
      (message.content.toLowerCase().includes('хватит') || message.content.toLowerCase().includes('прекращай') || message.content.toLowerCase().includes('перестань') || message.content.toLowerCase().includes('прекрати')) 
      && 
      (botNames.some(name => {return message.content.toLowerCase().includes(name)}) || checkName(message.content))
     ) {
    setActivity();
    let answersArray = ['Всё-всё!', 'Ну ещё 5 минуточек(', 'Ладно, прекращаю', 'Ничего нельзя(', 'Со мной легко договориться!'];
    let answersRandom = Math.floor(Math.random() * answersArray.length);    
    message.channel.send(answersArray[answersRandom]);
  }  
  
  if (!message.author.bot 
      &&
      (message.content.toLowerCase().includes('посмотри') || message.content.toLowerCase().includes('послушай') || message.content.toLowerCase().includes('поиграй')) 
      && 
      (botNames.some(name => {return message.content.toLowerCase().includes(name)}) || checkName(message.content))
     ) {
    
    let type;
    let activity;
    message.content.split(' ').forEach(elem => {
      if (elem == 'посмотри' || elem == 'послушай' || elem == 'поиграй') {    
        
        if (elem == 'посмотри') type = 'WATCHING';
        if (elem == 'послушай') type = 'LISTENING';
        if (elem == 'поиграй') type = 'PLAYING';
        
        activityArr = message.content.substring(message.content.indexOf(elem) + elem.length).trim().toLowerCase().split(' ');
        if (type == 'PLAYING' && activityArr[0] == 'в') {
          activityArr.shift();
          activity = activityArr.join(' ');
        } else {
          activity = activityArr.join(' ');
        }
      }
    });
    
    if (activity.length > 50) {
      message.channel.send('длинна, сложна, нипанятна :(');
      return;
    } else {
      setActivity(type, activity, (type, activity) => {
        if (type, activity) {
          let answersArray = ['Так точно!', 'Уже :)', '👌', 'Окь'];
          let answersRandom = Math.floor(Math.random() * answersArray.length);    
          message.channel.send(answersArray[answersRandom]);
        } else if (!type) {
          message.channel.send('Я не знаю, что с этим делать D:');
        } else if (!activity) {
          message.channel.send('Я не знаю, что именно надо делать D:');
        }
      });
    }
  }    
  
  if (!message.author.bot && message.content.toLowerCase().includes('кто молодец?')) {
    message.channel.send(`Ты молодец, <@${message.author.id}>!`);
    message.react('😍')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }
  
  if (!message.author.bot && message.content.toLowerCase().includes('кто хороший мальчик')) {
    message.channel.send(`Я хороший мальчик! 😊`);
    message.react('😊')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }
  
  if (message.content.toLowerCase().includes('кофе') || message.content.toLowerCase().includes('спать хо') || message.content.toLowerCase().includes('хочу спать') || message.content.toLowerCase().includes('хочется спат') || message.content.toLowerCase().includes('утро') || message.content.toLowerCase().includes('утра') || message.content.toLowerCase() === 'утр') {
        
    let foodArray = ['🥐', '🧀', '🥞', '🍳', '🍰', '🍩'];
    let foodRandom = Math.floor(Math.random() * foodArray.length);       
    let coffeeArray = ['☕', '🍵', '🥛'];
    let coffeeRandom = Math.floor(Math.random() * coffeeArray.length); 
    
    message.react(foodArray[foodRandom])
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);    
    
    message.react(coffeeArray[coffeeRandom])
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }
  
  if (botNames.some(name => {return message.content.toLowerCase().includes(name)}) || checkName(message.content)) {
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