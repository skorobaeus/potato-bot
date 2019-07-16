// Import the discord.js module
const Discord = require('discord.js');

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


/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
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
!ping — посчитает пинг. Не знаю зачем, прост
!count слово — посчитает использование слова на всех каналах (ееее)
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
    giveReaction(message, 3, ['👿', '😡', '👺', '😤', '😠']);
  }
  
  if (message.content.toLowerCase() === '!cry' && !message.author.bot) {
    giveReaction(message, 3, ['😟', '😨', '😰', '😥', '😢', '😭', '😖', '😣', '😞']);
  }

  if (message.content.toLowerCase() === '!omg' && !message.author.bot) {
    giveReaction(message, 3, ['🙀', '🙈', '😱', '😮', '😯']);
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
  
  //CHATTING
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
  
  if (message.content.toLowerCase().includes('кофе') || message.content.toLowerCase().includes('спать хо') || message.content.toLowerCase().includes('хочу спать') || message.content.toLowerCase().includes('хочется спат') || message.content.toLowerCase().includes('утро') || message.content.toLowerCase().includes('утра')) {
        
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
  
  if (message.content.toLowerCase().includes('картофел') || message.content.toLowerCase().includes('картошк') || message.content.toLowerCase().includes('картох') || message.content.toLowerCase().includes('potato')) {
    message.react('🥔')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }   
  
  if (message.content.toLowerCase().includes('пицц')) {
    message.react('🍕')
      .then(console.log(`Liked that: ${message.content}`))
      .catch(console.error);
  }   
  
  if(message.content.toLowerCase() === "what is love") {
    message.channel.send("BABY DON'T HURT ME");
    message.channel.awaitMessages(message => message.content.includes("DON'T HURT ME"))
      .then(got => {console.log(got.last());
                      got.last().channel.send("NO MORE")})
      .catch(got => console.log(Error));   
  }
  
  if (message.content.toLowerCase().includes('пиу')) {
    message.channel.send('Вжух!');
  }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login(process.env.BOT_TOKEN);