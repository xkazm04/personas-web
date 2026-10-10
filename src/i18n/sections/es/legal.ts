import type { Translations } from "../../en";

export const es: Pick<Translations, "legalPage" | "cookiePolicy" | "privacyPolicy"> = {
    legalPage: {
      title: "Legal",
      heading: "P\u00e1ginas legales pr\u00f3ximamente",
      description: "Nuestra pol\u00edtica de privacidad y t\u00e9rminos de servicio est\u00e1n siendo finalizados. Mientras tanto, si tienes alguna pregunta no dudes en contactarnos."
    },
    cookiePolicy: {
      tldr: [
        "Este sitio no usa cookies propias. Guarda algunos ajustes en el almacenamiento local de tu navegador y, si vinculas un tel\u00e9fono, una clave de firma en la base de datos del navegador de ese tel\u00e9fono. Cada elemento aparece en la lista de abajo.",
        "Sin publicidad, sin seguimiento entre sitios y sin huella digital de ning\u00fan tipo.",
        "Puedes borrarlo todo en cualquier momento desde los ajustes de tu navegador."
      ],
      lastUpdated: "\u00daltima actualizaci\u00f3n: {date}",
      approachHeading: "Nuestro enfoque sobre cookies y almacenamiento",
      approachBody: "Solo guardamos lo que el sitio necesita. Seg\u00fan las normas de la UE, el almacenamiento del navegador, como el almacenamiento local, cuenta como una cookie, as\u00ed que la lista de abajo incluye ambos. No usamos cookies publicitarias, p\u00edxeles de seguimiento ni huella digital.",
      registerHeading: "Lo que guardamos en tu dispositivo",
      registerIntro: "Todas las cookies y claves de almacenamiento que escribe este sitio, agrupadas por finalidad. Un nombre que termina en * representa una familia de claves, por ejemplo una por pol\u00edtica o lista de comprobaci\u00f3n.",
      categories: {
        necessary: {
          title: "Estrictamente necesarias",
          description: "Necesarias para que el sitio haga lo que pediste. Siempre est\u00e1n activas."
        },
        preferences: {
          title: "Preferencias",
          description: "Recuerdan lo que elegiste para que el sitio se vea y funcione como lo configuraste."
        },
        functional: {
          title: "Funcionales",
          description: "Mantienen las funciones entre visitas: tu progreso, lo que ya viste y tus votos."
        },
        analytics: {
          title: "Anal\u00edtica",
          description: "No se guarda nada para anal\u00edtica. Si eliges \"Aceptar todo\" en el banner de cookies, el sitio cuenta de forma an\u00f3nima las p\u00e1ginas vistas y algunas acciones clave, sin escribir nada en tu dispositivo. Si eliges \"Solo esenciales\", no se cuenta nada."
        }
      },
      mechanisms: {
        cookie: "Cookie",
        localStorage: "Almacenamiento local",
        indexedDB: "Base de datos del navegador (IndexedDB)"
      },
      lifetimes: {
        oneYear: "1 a\u00f1o",
        untilCleared: "Hasta que lo borres",
        untilSignOut: "Hasta que cierres sesi\u00f3n",
        untilUnpaired: "Hasta que desvincules el tel\u00e9fono o borres los datos del sitio"
      },
      purposes: {
        consent: "Recuerda lo que elegiste en el banner de cookies.",
        authSession: "Mantiene tu sesi\u00f3n iniciada en el panel. La escribe Supabase, nuestro proveedor de inicio de sesi\u00f3n, y solo si inicias sesi\u00f3n.",
        theme: "Recuerda el tema de color que elegiste.",
        language: "Recuerda el idioma que elegiste.",
        tourVolume: "Recuerda el volumen de la narraci\u00f3n del recorrido guiado.",
        dashboardPrefs: "Recuerda tus vistas, filtros y ajustes del panel, como la escalada de revisiones y la lectura en voz alta.",
        tourSeen: "Recuerda que ya viste el recorrido guiado, para no ofrec\u00e9rtelo de nuevo.",
        policySeen: "Recuerda cu\u00e1ndo le\u00edste por \u00faltima vez cada pol\u00edtica de esta p\u00e1gina, para poder se\u00f1alar las actualizaciones.",
        dashboardActivity: "Recuerda cu\u00e1ndo abriste el panel por \u00faltima vez y cu\u00e1ntas veces se reintent\u00f3 un evento de demostraci\u00f3n.",
        checklist: "Recuerda qu\u00e9 elementos de las listas de comprobaci\u00f3n de la gu\u00eda marcaste.",
        voting: "Un ID aleatorio que te permite votar una sola vez por funci\u00f3n, y un apodo aleatorio (como SwiftFox) que aparece en tus comentarios. Ambos se env\u00edan con tus votos y comentarios, y ninguno contiene informaci\u00f3n personal.",
        pairedPhoneKey: "Solo en un tel\u00e9fono que vincules con la app de escritorio: una clave de firma que el navegador cre\u00f3 y no puede exportar, un ID para este tel\u00e9fono, el ID del ordenador al que est\u00e1 vinculado y la fecha de la vinculaci\u00f3n. La clave firma los comandos que env\u00eda este tel\u00e9fono, para que tu ordenador pueda comprobar que vienen de \u00e9l."
      },
      notUsedHeading: "Lo que no usamos",
      notUsed: [
        "Ni cookies de publicidad ni de remarketing",
        "Ning\u00fan seguimiento entre sitios",
        "Ning\u00fan p\u00edxel de seguimiento de redes sociales",
        "Ni cookies ni almacenamiento de anal\u00edtica"
      ],
      thirdPartyHeading: "Cookies de terceros",
      thirdPartyBody: "Si inicias sesi\u00f3n, pasas por Supabase, nuestro proveedor de inicio de sesi\u00f3n, y por el proveedor de cuenta que elijas, como Google. Pueden establecer cookies en sus propios dominios durante el inicio de sesi\u00f3n, seg\u00fan sus propias pol\u00edticas. No usamos esas cookies para hacer seguimiento.",
      managingHeading: "Gestionar cookies y almacenamiento",
      managingBody: "Puedes borrar o bloquear las cookies y los datos del sitio desde los ajustes de tu navegador en cualquier momento. Al borrarlos se cierra tu sesi\u00f3n y se restablecen tus preferencias. Si tienes preguntas, escr\u00edbenos a {email}.",
      manageButton: "Gestionar preferencias de cookies"
    },
    privacyPolicy: {
      tldr: [
        "Personas ejecuta tus agentes en tu ordenador y los guarda all\u00ed, junto con tu historial de ejecuciones, tus notas y tus chats. Tus prompts van solo al proveedor de IA que elijas.",
        "La sincronizaci\u00f3n en la nube es opcional y est\u00e1 desactivada hasta que la actives. Copia tus agentes y sus ejecuciones a tu cuenta para que puedas verlos en la web. Las notas y los chats solo se sincronizan si adem\u00e1s activas sus propios interruptores.",
        "Un tel\u00e9fono que vincules puede iniciar, pausar, reanudar y detener tus agentes, aprobar o rechazar sus revisiones, y chatear con ellos y con Athena, sin un clic en tu ordenador. Puedes revocarlo en cualquier momento.",
        "Las claves de API se cifran con AES-256 y nunca salen de tu equipo, ni siquiera con la sincronizaci\u00f3n en la nube activada.",
        "Aparte de lo que elijas sincronizar, la app de escritorio solo nos env\u00eda informes de errores y se\u00f1ales de uso an\u00f3nimos, y puedes desactivar la mayor\u00eda.",
        "Solo recogemos tu correo electr\u00f3nico si inicias sesi\u00f3n para usar funciones en la nube.",
        "Puedes exportar o eliminar todo en cualquier momento. Solo tienes que pedirlo."
      ],
      lastUpdated: "\u00daltima actualizaci\u00f3n: {date}",
      commitmentHeading: "Nuestro compromiso con la privacidad",
      commitmentBody: "Personas se basa en un principio sencillo: tus datos te pertenecen. Nuestra app de escritorio es local-first. Salvo que actives la sincronizaci\u00f3n en la nube, tus agentes, prompts, resultados y credenciales nunca se nos env\u00edan, y los \u00fanicos datos que la app nos env\u00eda son los diagn\u00f3sticos an\u00f3nimos descritos m\u00e1s abajo. Tus credenciales nunca se nos env\u00edan, ni siquiera con la sincronizaci\u00f3n en la nube activada.",
      desktopHeading: "Qu\u00e9 guarda la app de escritorio",
      desktopBody: "Todo lo que crea la app de escritorio de Personas (tus agentes, pipelines, historial de ejecuciones, notas, conversaciones y configuraci\u00f3n) vive en tu ordenador. Nada de ello se env\u00eda a nuestros servidores salvo que actives la sincronizaci\u00f3n en la nube, descrita m\u00e1s abajo. Cuando un agente se ejecuta, su prompt va directamente de tu ordenador al proveedor de IA que elegiste: Claude de Anthropic, o un modelo local de Ollama que nunca sale de tu ordenador.",
      telemetryHeading: "Informes de errores y se\u00f1ales de uso de la app de escritorio",
      telemetryBody: "Las versiones publicadas de la app de escritorio env\u00edan a Sentry informes de errores (mensaje de error, traza de pila, sistema operativo, arquitectura y versi\u00f3n de la app) y se\u00f1ales de uso an\u00f3nimas (sesiones de la app, qu\u00e9 secciones y pesta\u00f1as abres, acciones clave como crear un agente e hitos \u00fanicos). Las sesiones y los hitos solo se asocian a un ID aleatorio del dispositivo o de la instalaci\u00f3n. Las direcciones IP, los correos electr\u00f3nicos, los nombres de usuario y los cuerpos y cabeceras de las peticiones se eliminan antes de enviar nada. No hay trazas de rendimiento, ni grabaciones de sesi\u00f3n, ni identidad de usuario, y tus prompts, el contenido de tus personas y tus credenciales nunca se incluyen.",
      telemetryControls: "Puedes desactivar las se\u00f1ales de uso y los informes de errores de la interfaz de la app al iniciarla por primera vez o en cualquier momento en Ajustes > Cuenta. Los informes de fallos del n\u00facleo nativo de la app a\u00fan no dependen de ese interruptor. Las versiones de desarrollo y las que compilas desde el c\u00f3digo fuente no env\u00edan nada.",
      credentialsHeading: "C\u00f3mo se protegen las credenciales",
      credentialsBody: "Las claves de API y los secretos que a\u00f1ades a Personas se cifran en reposo con AES-256-GCM y se guardan en el llavero de tu sistema operativo. Nunca salen de tu dispositivo, ni siquiera cuando usas la sincronizaci\u00f3n en la nube o un tel\u00e9fono vinculado.",
      syncHeading: "Sincronizaci\u00f3n en la nube opcional",
      syncIntro: "La sincronizaci\u00f3n en la nube est\u00e1 desactivada hasta que inicias sesi\u00f3n y la activas en los Ajustes de la app de escritorio. Te permite seguir a tus agentes en el sitio web de Personas, tambi\u00e9n desde tu tel\u00e9fono. Mientras est\u00e1 activada, la app copia esto a tu cuenta: tus agentes (incluidos sus nombres, descripciones e instrucciones), sus ejecuciones (incluidas la entrada, la salida, el coste y los errores), eventos, elementos pendientes de tu revisi\u00f3n, mensajes que te env\u00edan tus agentes, memorias, patrones aprendidos, problemas de salud, horas programadas, la cola de ejecuciones y totales diarios. Los valores que parecen secretos se eliminan de los datos de los eventos antes de enviarlos.",
      syncNever: "Nunca se sincronizan: claves de API, contrase\u00f1as y otras credenciales, ni los ajustes de los disparadores, como la configuraci\u00f3n de webhooks.",
      syncOptIns: "Otros dos tipos de datos solo se sincronizan si adem\u00e1s activas sus propios interruptores en los mismos Ajustes: \"Sincronizar notas\" y \"Sincronizar chats\". Ambos empiezan desactivados, aunque la sincronizaci\u00f3n en la nube ya est\u00e9 activada.",
      syncNotes: "\"Sincronizar notas\" copia tus objetivos del Notepad: el t\u00edtulo, el texto, el estado y el nombre del proyecto de cada nota (nunca la carpeta del proyecto en tu ordenador), y el breve resumen de su resultado. Las notas archivadas no se sincronizan.",
      syncChats: "\"Sincronizar chats\" copia tus conversaciones con Athena y con tus agentes, para que puedas leerlas y continuarlas desde tu tel\u00e9fono: el t\u00edtulo de cada conversaci\u00f3n activa, y tus mensajes y las respuestas desde 90 d\u00edas antes de activarlo. Las respuestas pueden citar lo que tus agentes leyeron a trav\u00e9s de las apps que conectaste. Los mensajes del sistema y de herramientas, los res\u00famenes de conversaciones, la memoria de trabajo de un agente y las conversaciones archivadas nunca se sincronizan.",
      syncMasking: "Antes de que el texto de una nota o de un chat salga de tu ordenador, se enmascara todo lo que parezca una clave, un token o una contrase\u00f1a, y el texto largo se recorta: los t\u00edtulos a 1 KB, el texto de las notas a 16 KB y cada mensaje de chat a 32 KB.",
      syncDeletion: "Al desactivar \"Sincronizar notas\" o \"Sincronizar chats\" se eliminan las notas o los chats que este ordenador sincroniz\u00f3, en su siguiente sincronizaci\u00f3n. Eliminar un chat con un agente en tu ordenador elimina su copia sincronizada, y eliminar un agente elimina su copia sincronizada, chats incluidos. Desactivar la propia sincronizaci\u00f3n en la nube detiene las copias nuevas, pero no elimina lo que ya se sincroniz\u00f3. Escr\u00edbenos y lo eliminaremos.",
      syncWhere: "Los datos sincronizados se guardan en Supabase, nuestro proveedor en la nube, en filas vinculadas a tu cuenta. Las reglas de acceso de la base de datos solo permiten que tu cuenta con la sesi\u00f3n iniciada lea o cambie esas filas, desde la app de escritorio o desde el sitio web. Los datos no est\u00e1n cifrados de extremo a extremo.",
      phonesHeading: "Tel\u00e9fonos vinculados",
      phonesIntro: "Mientras la sincronizaci\u00f3n en la nube est\u00e1 activada, puedes vincular un tel\u00e9fono escaneando un c\u00f3digo que muestra la app de escritorio en sus Ajustes. Desde el sitio web de Personas, un tel\u00e9fono vinculado puede iniciar, pausar y reanudar tus agentes, detener una ejecuci\u00f3n, aprobar o rechazar las revisiones que te esperan y chatear con Athena o con cualquiera de tus agentes, incluidos los que est\u00e1n en pausa (solo mientras \"Sincronizar chats\" est\u00e1 activado). Tu ordenador lo lleva a cabo sin preguntarte antes, y las ejecuciones, respuestas y trabajo aprobado que inicie usan tu plan de Claude. Un comando solo llega a tu ordenador mientras est\u00e1 encendido y conectado. Si no lo alcanza en un minuto, caduca en lugar de esperar.",
      phonesLimits: "Un tel\u00e9fono vinculado no puede editar tus agentes, ver ni cambiar tus credenciales, ni cambiar la cola de ejecuciones sin tu aprobaci\u00f3n en el ordenador. Sin vinculaci\u00f3n, una petici\u00f3n desde el sitio web para ejecutar un agente espera hasta que la apruebes en tu ordenador.",
      phonesKey: "Al vincularlo, el navegador del tel\u00e9fono crea una clave de firma que no se puede exportar y la guarda en el almacenamiento de ese navegador. Cada comando se firma con ella, y tu ordenador comprueba la firma con su propia lista de tel\u00e9fonos vinculados. El nombre del tel\u00e9fono (tomado de su navegador, como \"iPhone \u00b7 Safari\"), su clave p\u00fablica y los comandos que env\u00eda con sus resultados se guardan con tus datos sincronizados.",
      phonesRevoke: "Puedes revocar un tel\u00e9fono, o todos, en los Ajustes de la app de escritorio en cualquier momento. La revocaci\u00f3n se aplica en segundos, y una ejecuci\u00f3n ya iniciada termina. Tambi\u00e9n puedes desvincularlo desde el propio tel\u00e9fono, lo que borra all\u00ed su clave.",
      accountHeading: "Qu\u00e9 recogemos para las funciones en la nube",
      accountBody: "Si inicias sesi\u00f3n con Google para usar funciones en la nube, guardamos tu correo electr\u00f3nico y la informaci\u00f3n b\u00e1sica de tu perfil a trav\u00e9s de Supabase, nuestro proveedor de inicio de sesi\u00f3n. Si activas la sincronizaci\u00f3n en la nube o vinculas un tel\u00e9fono, tambi\u00e9n guardamos los datos descritos m\u00e1s arriba.",
      analyticsHeading: "Anal\u00edtica del sitio web",
      analyticsBody: "Si eliges \"{acceptAll}\" en el banner de cookies, este sitio web cuenta de forma an\u00f3nima las visitas a p\u00e1ginas y algunas acciones clave (clics de descarga, inscripciones en la lista de espera, votos a funciones y comentarios) para ayudarnos a entender qu\u00e9 p\u00e1ginas son \u00fatiles. Si eliges \"{essentialOnly}\", no se cuenta nada. No rastreamos a usuarios individuales, no creamos perfiles publicitarios ni vendemos datos a terceros.",
      thirdPartyHeading: "Servicios de terceros",
      thirdPartySupabase: "inicio de sesi\u00f3n y almacenamiento en la nube de los datos que eliges sincronizar",
      thirdPartySentry: "seguimiento de errores y los recuentos an\u00f3nimos mencionados en este sitio web, y los informes de errores y se\u00f1ales de uso de la app de escritorio",
      rightsHeading: "Tus derechos",
      rightsBody: "Puedes solicitar en cualquier momento el acceso, la rectificaci\u00f3n o la eliminaci\u00f3n de cualquier dato personal que tengamos, incluidos tus datos sincronizados. Tambi\u00e9n puedes exportar todos tus datos locales directamente desde la app de escritorio. Para ejercer estos derechos, escr\u00edbenos a {email}."
    },
};
