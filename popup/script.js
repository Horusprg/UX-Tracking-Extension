document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get('authToken', function (data) {
    if (data.authToken) {
      document.getElementById("divLogin").style.display = "none";
      document.getElementById("mainContent").style.display = "";
    } else {
      notification();
      var formLogin = $('#formLogin');

      formLogin.submit(function (e) {
        e.preventDefault();
        const username = $("#username").val();
        const password = $("#password").val();

        $.post("https://uxtracking.andrepereira.eng.br/external/userAuth",
          {
            username: username,
            password: password
          },
          function (authToken) {
            if (authToken.status == 200) {
              chrome.storage.sync.set({ "authToken": authToken.id }, function () {
                console.log("User Authenticated!");
              });
              document.getElementById("divLogin").style.display = "none";
              document.getElementById("mainContent").style.display = "";
            }else{
              var divExist = document.getElementById('errorLogin');
              if (divExist) {
                // Se a div existir, remova-a
                divExist.parentNode.removeChild(divExist);
              }
              var div = document.createElement('div');
              div.style.color = 'red';
              div.id = 'errorLogin';
              div.textContent = 'Verifique seu nome de usuário e senha e tente novamente';
              var targetElement = document.getElementById('login');
              targetElement.insertAdjacentElement('beforebegin', div);
            }
          });
      });
    }
  });

  const links = document.querySelectorAll("a");

  links.forEach(link => {
    const location = link.getAttribute('href');
    link.addEventListener('click', () => chrome.tabs.create({ active: true, url: location }));
  });
});

function setKey(e, key) {
  let target = e.target.checked

  chrome.storage.sync.set({ [key]: target }).catch((e) => {
    console.error(e)
  })
}

function getKey(id, key) {
  chrome.storage.sync.get([key]).then((result) => {
    let target = result[key]

    document.getElementById(id).checked = !!target
  })
}

getKey('__listen_mouse__', 'mouse')
getKey('__listen_keyboard__', 'keyboard')
getKey('__listen_microphone__', 'microphone')
getKey('__listen_camera__', 'camera')
getKey('__listen_record__', 'record')

document.getElementById('__listen_mouse__').addEventListener('change', (e) => {
  setKey(e, 'mouse')
})

document
  .getElementById('__listen_keyboard__')
  .addEventListener('change', (e) => {
    setKey(e, 'keyboard')
  })

document
  .getElementById('__listen_microphone__')
  .addEventListener('change', (e) => {
    setKey(e, 'microphone')
  })

document.getElementById('__listen_camera__').addEventListener('change', (e) => {
  setKey(e, 'camera')
})

document
  .getElementById('__listen_record__')
  .addEventListener('change', (e) => {
    setKey(e, 'record')
  })

function notification() {
  var options = {
    type: 'basic',
    iconUrl: 'logo.png',
    title: 'UX-Tracking: Login necessário!',
    message: 'Faça o login para iniciar a captura!\nClique no botão abaixo ou abra o menu da extensão.',
    buttons: [{ title: 'Fazer login' }]
  };
  
  chrome.notifications.create('loginNotification', options, function(notificationId) {
    // Define um ouvinte para o clique na notificação
    chrome.notifications.onButtonClicked.addListener(function(clickedNotificationId, buttonIndex) {
      if (clickedNotificationId === 'loginNotification' && buttonIndex === 0) {
        // Abre a popup da extensão quando o usuário clica no botão "Fazer Login"
        chrome.windows.create({
          url: 'popup/index.html', // Substitua pelo URL da sua popup HTML
          type: 'popup',
          width: 300,
          height: 350
        });
      }
    });
  });
}