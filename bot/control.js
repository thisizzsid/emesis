#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '.env');

// Load current env
function loadEnv() {
  const env = dotenv.parse(fs.readFileSync(envPath));
  return env;
}

// Save env
function saveEnv(env) {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  fs.writeFileSync(envPath, lines.join('\n'));
  console.log('✅ Settings saved!');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function showMenu() {
  console.clear();
  console.log('═══════════════════════════════════════════');
  console.log('    🤖 EMESIS BOT CONTROL PANEL 🤖');
  console.log('═══════════════════════════════════════════\n');

  const env = loadEnv();

  console.log('📊 CURRENT STATUS:');
  console.log(`  Auto-Post:    ${env.ENABLE_AUTO_POST === 'true' ? '✅ ON' : '❌ OFF'} (every ${parseInt(env.POST_INTERVAL) / 60000} min)`);
  console.log(`  Auto-Like:    ${env.ENABLE_AUTO_LIKE === 'true' ? '✅ ON' : '❌ OFF'} (every ${parseInt(env.LIKE_INTERVAL) / 60000} min)`);
  console.log(`  Auto-Comment: ${env.ENABLE_AUTO_COMMENT === 'true' ? '✅ ON' : '❌ OFF'} (every ${parseInt(env.COMMENT_INTERVAL) / 60000} min)`);
  console.log(`\n  Bot Name: ${env.BOT_NAME}`);
  console.log(`  Bot Email: ${env.BOT_EMAIL}\n`);

  console.log('═══════════════════════════════════════════');
  console.log('1. Toggle Auto-Post');
  console.log('2. Toggle Auto-Like');
  console.log('3. Toggle Auto-Comment');
  console.log('4. Change Post Interval');
  console.log('5. Change Like Interval');
  console.log('6. Change Comment Interval');
  console.log('7. Change Bot Name');
  console.log('8. View Full Config');
  console.log('9. Reset to Defaults');
  console.log('0. Exit');
  console.log('═══════════════════════════════════════════\n');

  const choice = await question('Choose option (0-9): ');
  return choice;
}

async function main() {
  while (true) {
    const choice = await showMenu();
    const env = loadEnv();

    switch (choice) {
      case '1':
        env.ENABLE_AUTO_POST = env.ENABLE_AUTO_POST === 'true' ? 'false' : 'true';
        saveEnv(env);
        console.log(`\n🔄 Auto-Post: ${env.ENABLE_AUTO_POST === 'true' ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log('⚠️  Restart bot to apply changes\n');
        break;

      case '2':
        env.ENABLE_AUTO_LIKE = env.ENABLE_AUTO_LIKE === 'true' ? 'false' : 'true';
        saveEnv(env);
        console.log(`\n🔄 Auto-Like: ${env.ENABLE_AUTO_LIKE === 'true' ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log('⚠️  Restart bot to apply changes\n');
        break;

      case '3':
        env.ENABLE_AUTO_COMMENT = env.ENABLE_AUTO_COMMENT === 'true' ? 'false' : 'true';
        saveEnv(env);
        console.log(`\n🔄 Auto-Comment: ${env.ENABLE_AUTO_COMMENT === 'true' ? '✅ ENABLED' : '❌ DISABLED'}`);
        console.log('⚠️  Restart bot to apply changes\n');
        break;

      case '4':
        const postMin = await question('Post interval (minutes): ');
        env.POST_INTERVAL = String(parseInt(postMin) * 60000);
        saveEnv(env);
        console.log('⚠️  Restart bot to apply changes\n');
        break;

      case '5':
        const likeMin = await question('Like interval (minutes): ');
        env.LIKE_INTERVAL = String(parseInt(likeMin) * 60000);
        saveEnv(env);
        console.log('⚠️  Restart bot to apply changes\n');
        break;

      case '6':
        const commentMin = await question('Comment interval (minutes): ');
        env.COMMENT_INTERVAL = String(parseInt(commentMin) * 60000);
        saveEnv(env);
        console.log('⚠️  Restart bot to apply changes\n');
        break;

      case '7':
        const botName = await question('New bot name: ');
        env.BOT_NAME = botName;
        saveEnv(env);
        console.log('⚠️  Restart bot to apply changes\n');
        break;

      case '8':
        console.log('\n📋 FULL CONFIGURATION:');
        console.log('───────────────────────────────────');
        Object.entries(env).forEach(([key, value]) => {
          console.log(`${key}=${value}`);
        });
        console.log('───────────────────────────────────\n');
        break;

      case '9':
        const confirm = await question('Reset to defaults? (y/n): ');
        if (confirm.toLowerCase() === 'y') {
          const defaults = {
            FIREBASE_PROJECT_ID: 'e2emesis',
            BOT_NAME: 'EMESIS Bot',
            BOT_EMAIL: 'bot@emesis.local',
            POST_INTERVAL: '3600000',
            LIKE_INTERVAL: '600000',
            COMMENT_INTERVAL: '900000',
            ENABLE_AUTO_POST: 'true',
            ENABLE_AUTO_LIKE: 'true',
            ENABLE_AUTO_COMMENT: 'true',
          };
          saveEnv(defaults);
          console.log('\n✅ Reset to defaults\n');
        }
        break;

      case '0':
        console.log('\n👋 Goodbye!\n');
        rl.close();
        return;

      default:
        console.log('\n❌ Invalid option\n');
    }

    await question('Press Enter to continue...');
  }
}

main().catch(console.error);
