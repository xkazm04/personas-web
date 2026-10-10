import type { Translations } from "../../en";

export const es: Pick<Translations, "athenaPage"> = {
    athenaPage: {
      nav: {
        meet: "CONOCE A ATHENA",
        onboarding: "PRIMEROS PASOS",
        fleet: "DE UNA FRASE",
        workshop: "LO QUE LLEVA",
        portfolio: "PROYECTOS",
        memory: "MEMORIA",
        oneMind: "UNA SOLA MENTE"
      },
      hero: {
        eyebrow: "Tu mano derecha",
        headline: "Te presento a",
        headlineGradient: "Athena",
        tagline: "No dice nada cuando no hay nada que decir.",
        persona: "Una estratega, no una asistente animada \u2014 directa, con criterio, cercana sin fingir. \u00abLa velocidad no es tu trabajo. La calidad s\u00ed.\u00bb",
        ctaPrimary: "Verla trabajar",
        ctaSecondary: "Descargar Personas",
        statWhisper: "Funciona entera en tu equipo \u00b7 t\u00fa decides hasta d\u00f3nde llega",
        avatarAlt: "Athena, la compa\u00f1era de Personas",
        orbAria: "Athena \u2014 pulsa Enter y te responde",
        acknowledgeLine: "Te escucho.",
        calloutsAria: "Lo que Athena hace por ti",
        callouts: [
          { label: "H\u00e1blale", fact: "Mant\u00e9n pulsado y habla" },
          { label: "De un vistazo", fact: "Mira en qu\u00e9 est\u00e1 trabajando" },
          { label: "Tu escritorio", fact: "Ll\u00e9vala donde trabajas" },
          { label: "Siempre lista", fact: "Cmd/Ctrl+Shift+A, desde cualquier app" }
        ]
      },
      onboarding: {
        intro: { eyebrow: "Lo montamos juntos", heading: "Primeros pasos", gradient: "en compa\u00f1\u00eda" },
        chrome: {
          appName: "Personas",
          search: "Buscar\u2026",
          nav: ["Inicio", "Agentes", "Plantillas", "Conectores", "B\u00f3veda", "Ajustes"],
          usageLabel: "ejecuciones hoy",
          usageValue: "18 / 25",
          newAgent: "Nuevo agente"
        },
        canvas: {
          crumbs: ["Espacio", "Automatizaci\u00f3n"],
          filters: ["Todo", "Populares", "Programados", "Nuevos"],
          templatesLabel: "Plantillas",
          templatesHint: "12 plantillas",
          template: {
            title: "Resumen diario",
            meta: "resumir \u00b7 publicar \u00b7 9:00",
            pill: "popular",
            schedule: "Cada d\u00eda 9:00",
            runs: "142 ejecuciones",
            health: "98 % ok"
          },
          templateAlt: {
            title: "Triaje del buz\u00f3n",
            meta: "etiquetar \u00b7 redactar \u00b7 archivar",
            pill: "nuevo",
            schedule: "Con correo nuevo",
            runs: "86 ejecuciones",
            health: "94 % ok"
          },
          runsTitle: "\u00daltimas ejecuciones",
          runsHint: "\u00faltimas 24 h",
          runsCols: ["agente", "estado", "dur\u00f3"],
          runsRows: [
            { name: "Resumen diario", state: "ok", took: "1,2 s" },
            { name: "Revisi\u00f3n de PR", state: "ok", took: "0,8 s" },
            { name: "Sync de notas", state: "en curso", took: "\u2014" }
          ],
          connectLabel: "Conecta una herramienta",
          connectCount: "2 de 9 conectadas",
          connectCountDone: "3 de 9 conectadas",
          slack: {
            name: "Slack",
            detail: "#general \u00b7 novedades",
            connect: "conectar",
            connecting: "conectando\u2026",
            connected: "conectado"
          },
          chips: [
            { name: "GitHub", detail: "sync hace 2 min", state: "conectado" },
            { name: "Notion", detail: "12 p\u00e1ginas", state: "conectado" }
          ],
          triggerLabel: "Disparador",
          triggerIdle: "A\u00fan sin horario",
          triggerIdleShort: "Sin definir",
          triggerValue: "Cada ma\u00f1ana \u00b7 9:00",
          triggerValueShort: "A diario \u00b7 9:00",
          triggerHint: "editar",
          triggerDays: ["D", "L", "M", "X", "J", "V", "S"],
          triggerZone: "UTC+1",
          triggerOff: "no",
          triggerOn: "s\u00ed",
          activityLabel: "Monitorizaci\u00f3n",
          activityPill: "en vivo",
          stats: [
            { value: "24", label: "ejecuciones" },
            { value: "98 %", label: "\u00e9xito" },
            { value: "1,4 s", label: "media" }
          ],
          action: "Crear agente",
          actionDone: "Agente creado"
        },
        captions: {
          template: "elige un punto de partida",
          connect: "conecta tu Slack",
          trigger: "elige cu\u00e1ndo se ejecuta",
          action: "un clic \u2014 y en marcha"
        },
        status: {
          setup: "espacio \u00b7 mont\u00e1ndolo juntos",
          setupShort: "mont\u00e1ndolo",
          step: "paso {n}/{total} \u00b7 hecho contigo",
          stepShort: "paso {n}/{total}",
          live: "agente en marcha \u00b7 monitorizando",
          liveShort: "en marcha"
        }
      },
      fleet: {
        intro: { eyebrow: "Dilo con tus palabras", heading: "Una flota", gradient: "coordinada" },
        request: {
          placeholder: "P\u00eddele a Athena lo que sea\u2026",
          voice: "o simplemente dilo",
          sent: "enviado",
          clauses: [
            ["Saca ", "los tickets de la semana pasada", ","],
            [" busca ", "las quejas que se repiten", ","],
            [" mira ", "lo que ya arreglamos", ","],
            [" cuenta ", "a cu\u00e1nta gente le toc\u00f3", ","],
            [" y ", "dile al equipo lo que importa", "."]
          ]
        },
        plan: {
          hint: "Cambia lo que quieras antes de empezar",
          hintShort: "Cambia lo que quieras",
          edited: "Cambiado",
          start: "Empezar",
          working: "Trabajando",
          done: "Listo"
        },
        task: { working: "trabajando", finished: "listo" },
        tasks: [
          {
            title: "Reunir los tickets",
            scope: "\u00faltimos 7 d\u00edas",
            scopeEdited: "\u00faltimos 14 d\u00edas",
            found: "1.284 tickets"
          },
          { title: "Agrupar las quejas repetidas", scope: "todos los canales", found: "9 grupos" },
          { title: "Ver qu\u00e9 ya lanzamos", scope: "desde mayo", found: "4 ya arreglados" },
          { title: "Contar a qui\u00e9n afect\u00f3", scope: "por cuenta", found: "612 cuentas" }
        ],
        result: {
          title: "Lo que importa esta semana",
          rows: [
            { label: "Errores en el pago", meta: "214 personas" },
            { label: "B\u00fasqueda lenta", meta: "96 personas" },
            { label: "Bucle de acceso", meta: "arreglado el martes" }
          ],
          footer: "enviado al equipo"
        },
        status: {
          speak: "dilo o escr\u00edbelo \u2014 da igual",
          speakShort: "escr\u00edbelo o dilo",
          planning: "Athena calcula lo que hace falta",
          pieces: "una frase, cuatro trabajos",
          piecesShort: "cuatro trabajos",
          yourCall: "nada arranca sin tu permiso",
          yourCallShort: "t\u00fa das la salida",
          parallel: "los cuatro a la vez",
          parallelShort: "cuatro a la vez",
          returning: "vuelve como una sola respuesta",
          returningShort: "vuelve como una",
          closing: "una frase dentro \u00b7 una respuesta fuera",
          closingShort: "una respuesta de vuelta"
        }
      },
      workshop: {
        intro: { eyebrow: "Le des lo que le des", heading: "Los l\u00edmites que pusiste", gradient: "aguantan" },
        beds: [
          { name: "App de pago", short: "Pago" },
          { name: "Web de marketing", short: "Web" },
          { name: "Servicio de cobros", short: "Cobros" }
        ],
        jobTitles: [
          "pasar los tests",
          "revisar los enlaces",
          "limpiar los avisos",
          "arreglar el test inestable",
          "actualizar el changelog",
          "ordenar las ramas viejas"
        ],
        fence: { plate: "los sitios que abriste", plateShort: "sitios que abriste" },
        dial: {
          label: "cu\u00e1nto hace por su cuenta",
          labelShort: "cu\u00e1nto hace sola",
          stops: ["preg\u00fantame antes", "las cosas peque\u00f1as", "adelante"],
          stopsShort: ["preg\u00fantame", "cosas peque\u00f1as", "adelante"]
        },
        job: { working: "trabajando", done: "listo" },
        outside: { name: "Cliente antiguo", waits: "te espera" },
        status: {
          line: "el l\u00edmite va primero",
          lineShort: "el l\u00edmite va primero",
          draw: "lo trazas una vez",
          drawShort: "lo trazas una vez",
          places: "estos son los sitios abiertos",
          placesShort: "los sitios que abriste",
          inside: "trabaja dentro \u2014 en todo ello",
          insideShort: "trabaja dentro",
          turnUp: "s\u00fabelo \u2014 m\u00e1s a la vez, menos preguntas",
          turnUpShort: "s\u00fabelo \u2014 m\u00e1s a la vez",
          unmoved: "el l\u00edmite no se mueve con eso",
          unmovedShort: "el l\u00edmite no se mueve",
          stops: "para donde t\u00fa la paraste",
          stopsShort: "para en el l\u00edmite",
          waits: "y espera \u2014 eso es tuyo",
          waitsShort: "eso es tuyo",
          free: "tan libre como quieras, dentro de tus l\u00edmites",
          freeShort: "libre, dentro de tus l\u00edmites"
        }
      },
      portfolio: {
        intro: { eyebrow: "Mientras andas en otra cosa", heading: "Nada se pudre", gradient: "en silencio" },
        projects: [
          "Web de marketing",
          "Documentaci\u00f3n",
          "App m\u00f3vil",
          "Sistema de dise\u00f1o",
          "Buz\u00f3n de soporte",
          "Pipeline de datos",
          "Herramientas admin",
          "API de pagos",
          "Servicio de b\u00fasqueda",
          "Alta de usuarios",
          "Notificaciones",
          "Wiki interna"
        ],
        field: { handled: "resuelto" },
        panel: {
          badge: "lo peor primero",
          rows: [
            { name: "Dependencias", since: "en silencio 11 d\u00edas" },
            { name: "Build nocturna", since: "en rojo desde el viernes" }
          ],
          rest: "otras 5 revisiones bien",
          finding: "La librer\u00eda de pagos va 3 versiones atrasada, una con un agujero conocido.",
          findingShort: "3 versiones atr\u00e1s, una con agujero.",
          action: "Abrir lo que lo arregla",
          actionShort: "Abrir el arreglo",
          done: "Abierto"
        },
        caption: {
          survey: "Revisando cada proyecto",
          surfaced: "Tres te necesitan",
          worst: "Este primero",
          found: "11 d\u00edas en silencio",
          opened: "Abierto para ti"
        },
        status: {
          view: "todos tus proyectos a la vista",
          viewShort: "todos a la vista",
          checking: "revis\u00e1ndolos todos a la vez",
          checkingShort: "revis\u00e1ndolos todos",
          needing: "3 te necesitan \u00b7 lo peor primero",
          needingShort: "3 te necesitan",
          travel: "directa al peor de todos",
          travelShort: "el peor primero",
          quiet: "payments api \u00b7 11 d\u00edas en silencio",
          quietShort: "11 d\u00edas en silencio",
          opened: "abri\u00f3 lo que lo arregla",
          openedShort: "abierto para ti",
          back: "de vuelta al cuadro completo",
          backShort: "de vuelta",
          settled: "1 resuelto \u00b7 2 a\u00fan esperan",
          settledShort: "1 resuelto \u00b7 2 esperan"
        }
      },
      memory: {
        intro: {
          eyebrow: "Cuanto m\u00e1s tiempo trabajas con ella",
          heading: "m\u00e1s",
          gradient: "lleva consigo"
        },
        talk: "lo hablado cada d\u00eda",
        rail: "bastante para una noche",
        night: "lo piensa de noche",
        shelf: "lo que se queda",
        kept: [
          "Publicas los jueves.",
          "En staging pruebas cosas.",
          "Los cobros son lo que te preocupa.",
          "Primero quieres la versi\u00f3n corta."
        ],
        status: {
          day: "un d\u00eda normal trabajando con ella",
          dayShort: "un d\u00eda normal",
          building: "todo lo del d\u00eda se va acumulando",
          buildingShort: "lo del d\u00eda, acumul\u00e1ndose",
          sleeps: "ya hay bastante \u2014 lo piensa de noche",
          sleepsShort: "lo piensa de noche",
          wakes: "despierta con algo m\u00e1s que ayer",
          wakesShort: "algo m\u00e1s que antes",
          keeping: "otra noche, otra cosa que guardar",
          keepingShort: "otra cosa que guardar",
          quiet: "un d\u00eda tranquilo \u2014 casi nada dicho",
          quietShort: "un d\u00eda tranquilo",
          notEnough: "no da para pensarlo, as\u00ed que no",
          notEnoughShort: "no da para pensarlo",
          nothingLost: "no se pierde nada \u2014 ese d\u00eda sigue ah\u00ed",
          nothingLostShort: "sigue ah\u00ed, nada perdido",
          inUse: "y lo primero que guard\u00f3 sirve hoy",
          inUseShort: "lo del primer d\u00eda, hoy",
          sleepsAgain: "tambi\u00e9n lo piensa esta noche",
          sleepsAgainShort: "tambi\u00e9n lo piensa esta noche",
          cost: "le cuesta menos que una respuesta",
          costShort: "menos que una respuesta",
          oneMore: "otra noche, otra cosa que lleva",
          oneMoreShort: "otra cosa que lleva",
          carries: "cuanto m\u00e1s trabajas con ella, m\u00e1s lleva consigo",
          carriesShort: "m\u00e1s lleva consigo"
        }
      },
      oneMind: {
        intro: { eyebrow: "Por muchas conversaciones que haya", heading: "siempre la", gradient: "misma persona" },
        conversations: [
          { name: "La reescritura", short: "Reescritura" },
          { name: "Revisi\u00f3n del lunes", short: "Lunes" },
          { name: "La puesta en marcha", short: "Arranque" },
          { name: "La ca\u00edda", short: "Ca\u00edda" },
          { name: "La p\u00e1gina de precios", short: "Precios" },
          { name: "Facturas", short: "Facturas" }
        ],
        open: {
          label: "esta conversaci\u00f3n",
          question: "\u00bfEn qu\u00e9 m\u00e1s estamos?",
          from: "fuente:",
          footer: "Hoy no te necesita nada m\u00e1s.",
          footerShort: "Nada m\u00e1s te necesita."
        },
        rows: [
          {
            claim: "La \u00faltima comprobaci\u00f3n pas\u00f3 hace una hora",
            short: "\u00daltima comprobaci\u00f3n ok"
          },
          { claim: "Dos proyectos te esperan, ninguno urgente", short: "2 esperan, nada urgente" },
          { claim: "Tu calendario sigue sin conectar", short: "Calendario sin conectar" }
        ],
        status: {
          live: "todas las conversaciones que llevas",
          liveShort: "todas tus conversaciones",
          open: "todas abiertas a la vez",
          openShort: "todas a la vez",
          asked: "preguntaste en una de ellas",
          askedShort: "preguntaste aqu\u00ed",
          answers: "responde con todo lo que sabe",
          answersShort: "responde con todo",
          sources: "cada l\u00ednea, y de d\u00f3nde viene",
          sourcesShort: "cada l\u00ednea con su origen",
          oneVoice: "una voz \u2014 nunca dos a la vez",
          oneVoiceShort: "una voz, nunca dos",
          samePerson: "la misma persona, en todas",
          samePersonShort: "la misma persona, en todas"
        }
      }
    },
};
