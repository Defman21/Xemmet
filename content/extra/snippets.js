(function() {
    var snippets = {
        "css": {
            "@i": "@import  url(|);",
            "@import": "@import  url(|);",
            "@m": "@media ${1:screen} {\n\t|\n}",
            "@media": "@media ${1:screen} {\n\t|\n}",
            "@f": "@font-face {\n\tfont-family: |;\n\tsrc: url(|);\n}",
            "@f+": "@font-face {\n\tfont-family: '${1:FontName}';\n\tsrc: url('${2:FileName}.eot');\n\tsrc: url('${2:FileName}.eot?#iefix') format('embedded-opentype'),\n\t\t url('${2:FileName}.woff') format('woff'),\n\t\t url('${2:FileName}.ttf') format('truetype'),\n\t\t url('${2:FileName}.svg#${1:FontName}') format('svg');\n\tfont-style: ${3:normal};\n\tfont-weight: ${4:normal};\n}",

            "@kf": "@-webkit-keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}\n@-o-keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}\n@-moz-keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}\n@keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}",


            "anim": "animation: |;",
            "anim-": "animation: ${1:name} ${2:duration} ${3:timing-function} ${4:delay} ${5:iteration-count} ${6:direction} ${7:fill-mode};",
            "animdel": "animation-delay: ${1:time};",
            "animdir": "animation-direction: ${1:normal};",
            "animdirn": "animation-direction: normal;",
            "animdirr": "animation-direction: reverse;",
            "animdira": "animation-direction: alternate;",
            "animdirar": "animation-direction: alternate-reverse;",

            "animdur": "animation-duration: ${1:0}s;",

            "animfm": "animation-fill-mode: ${1:both};",
            "animfmf": "animation-fill-mode: forwards;",
            "animfmb": "animation-fill-mode: backwards;",
            "animfmbt": "animation-fill-mode: both;",
            "animfmbh": "animation-fill-mode: both;",

            "animic": "animation-iteration-count: ${1:1};",
            "animici": "animation-iteration-count: infinite;",

            "animn": "animation-name: ${1: none};",

            "animps": "animation-play-state: ${1:running};",
            "animpsp": "animation-play-state: paused;",
            "animpsr": "animation-play-state: running;",

            "animtf": "animation-timing-function: ${1:linear};",
            "animtfe": "animation-timing-function: ease;",
            "animtfei": "animation-timing-function: ease-in;",
            "animtfeo": "animation-timing-function: ease-out;",
            "animtfeio": "animation-timing-function: ease-in-out;",
            "animtfl": "animation-timing-function: linear;",
            "animtfcb": "animation-timing-function: cubic-bezier(${1:0.1}, ${2:0.7}, ${3:1.0}, ${3:0.1});",

            "ap": "appearance: ${none};",

            "!": "!important",
            "pos": "position: ${1:relative};",
            "poss": "position: static;",
            "posa": "position: absolute;",
            "posr": "position: relative;",
            "posf": "position: fixed;",
            "t": "top: |;",
            "ta": "top: auto;",
            "r": "right: |;",
            "ra": "right: auto;",
            "b": "bottom: |;",
            "ba": "bottom: auto;",
            "l": "left: |;",
            "la": "left: auto;",
            "z": "z-index: |;",
            "za": "z-index: auto;",
            "fl": "float: ${1:left};",
            "fln": "float: none;",
            "fll": "float: left;",
            "flr": "float: right;",
            "cl": "clear: ${1:both};",
            "cln": "clear: none;",
            "cll": "clear: left;",
            "clr": "clear: right;",
            "clb": "clear: both;",

            "colm": "columns: |;",
            "colmc": "column-count: |;",
            "colmf": "column-fill: |;",
            "colmg": "column-gap: |;",
            "colmr": "column-rule: |;",
            "colmrc": "column-rule-color: |;",
            "colmrs": "column-rule-style: |;",
            "colmrw": "column-rule-width: |;",
            "colms": "column-span: |;",
            "colmw": "column-width: |;",

            "d": "display: ${1:block};",
            "dn": "display: none;",
            "db": "display: block;",
            "di": "display: inline;",
            "dib": "display: inline-block;",
            "dli": "display: list-item;",
            "dri": "display: run-in;",
            "dcp": "display: compact;",
            "dtb": "display: table;",
            "ditb": "display: inline-table;",
            "dtbcp": "display: table-caption;",
            "dtbcl": "display: table-column;",
            "dtbclg": "display: table-column-group;",
            "dtbhg": "display: table-header-group;",
            "dtbfg": "display: table-footer-group;",
            "dtbr": "display: table-row;",
            "dtbrg": "display: table-row-group;",
            "dtbc": "display: table-cell;",
            "drb": "display: ruby;",
            "drbb": "display: ruby-base;",
            "drbbg": "display: ruby-base-group;",
            "drbt": "display: ruby-text;",
            "drbtg": "display: ruby-text-group;",
            "v": "visibility: ${1:hidden};",
            "vv": "visibility: visible;",
            "vh": "visibility: hidden;",
            "vc": "visibility: collapse;",
            "ov": "overflow: ${1:hidden};",
            "ovv": "overflow: visible;",
            "ovh": "overflow: hidden;",
            "ovs": "overflow: scroll;",
            "ova": "overflow: auto;",
            "ovx": "overflow-x: ${1:hidden};",
            "ovxv": "overflow-x: visible;",
            "ovxh": "overflow-x: hidden;",
            "ovxs": "overflow-x: scroll;",
            "ovxa": "overflow-x: auto;",
            "ovy": "overflow-y: ${1:hidden};",
            "ovyv": "overflow-y: visible;",
            "ovyh": "overflow-y: hidden;",
            "ovys": "overflow-y: scroll;",
            "ovya": "overflow-y: auto;",
            "ovsa": "overflow-style: auto;",
            "ovss": "overflow-style: scrollbar;",
            "ovsp": "overflow-style: panner;",
            "ovsm": "overflow-style: move;",
            "ovsmq": "overflow-style: marquee;",
            "zoo": "zoom: 1;",
            "zm": "zoom: 1;",
            "cp": "clip: |;",
            "cpa": "clip: auto;",
            "cpr": "clip: rect(${1:top} ${2:right} ${3:bottom} ${4:left});",
            "bxz": "box-sizing: ${1:border-box};",
            "bxzcb": "box-sizing: content-box;",
            "bxzbb": "box-sizing: border-box;",
            "bxsh": "box-shadow: ${1:inset }${2:hoff} ${3:voff} ${4:blur} ${5:color};",
            "bxshr": "box-shadow: ${1:inset }${2:hoff} ${3:voff} ${4:blur} ${5:spread }rgb(${6:0}, ${7:0}, ${8:0});",
            "bxshra": "box-shadow: ${1:inset }${2:h} ${3:v} ${4:blur} ${5:spread }rgba(${6:0}, ${7:0}, ${8:0}, .${9:5});",
            "bxshn": "box-shadow: none;",
            "m": "margin: |;",
            "ma": "margin: auto;",
            "mt": "margin-top: |;",
            "mta": "margin-top: auto;",
            "mr": "margin-right: |;",
            "mra": "margin-right: auto;",
            "mb": "margin-bottom: |;",
            "mba": "margin-bottom: auto;",
            "ml": "margin-left: |;",
            "mla": "margin-left: auto;",
            "p": "padding: |;",
            "pt": "padding-top: |;",
            "pr": "padding-right: |;",
            "pb": "padding-bottom: |;",
            "pl": "padding-left: |;",
            "w": "width: |;",
            "wa": "width: auto;",
            "h": "height: |;",
            "ha": "height: auto;",
            "maw": "max-width: |;",
            "mawn": "max-width: none;",
            "mah": "max-height: |;",
            "mahn": "max-height: none;",
            "miw": "min-width: |;",
            "mih": "min-height: |;",
            "mar": "max-resolution: ${1:res};",
            "mir": "min-resolution: ${1:res};",
            "ori": "orientation: |;",
            "oril": "orientation: landscape;",
            "orip": "orientation: portrait;",
            "ol": "outline: |;",
            "oln": "outline: none;",
            "olo": "outline-offset: |;",
            "olw": "outline-width: |;",
            "ols": "outline-style: |;",
            "olc": "outline-color: #${1:000};",
            "olci": "outline-color: invert;",
            "bd": "border: |;",
            "bd+": "border: ${1:1px} ${2:solid} ${3:#000};",
            "bdn": "border: none;",
            "bdbk": "border-break: ${1:close};",
            "bdbkc": "border-break: close;",
            "bdcl": "border-collapse: |;",
            "bdclc": "border-collapse: collapse;",
            "bdcls": "border-collapse: separate;",
            "bdc": "border-color: #${1:000};",
            "bdct": "border-color: transparent;",
            "bdi": "border-image: url(|);",
            "bdin": "border-image: none;",
            "bdti": "border-top-image: url(|);",
            "bdtin": "border-top-image: none;",
            "bdri": "border-right-image: url(|);",
            "bdrin": "border-right-image: none;",
            "bdbi": "border-bottom-image: url(|);",
            "bdbin": "border-bottom-image: none;",
            "bdli": "border-left-image: url(|);",
            "bdlin": "border-left-image: none;",
            "bdci": "border-corner-image: url(|);",
            "bdcin": "border-corner-image: none;",
            "bdcic": "border-corner-image: continue;",
            "bdtli": "border-top-left-image: url(|);",
            "bdtlin": "border-top-left-image: none;",
            "bdtlic": "border-top-left-image: continue;",
            "bdtri": "border-top-right-image: url(|);",
            "bdtrin": "border-top-right-image: none;",
            "bdtric": "border-top-right-image: continue;",
            "bdbri": "border-bottom-right-image: url(|);",
            "bdbrin": "border-bottom-right-image: none;",
            "bdbric": "border-bottom-right-image: continue;",
            "bdbli": "border-bottom-left-image: url(|);",
            "bdblin": "border-bottom-left-image: none;",
            "bdblic": "border-bottom-left-image: continue;",
            "bdf": "border-fit:  ${1:repeat};",
            "bdfc": "border-fit: clip;",
            "bdfr": "border-fit: repeat;",
            "bdfsc": "border-fit: scale;",
            "bdfst": "border-fit: stretch;",
            "bdfow": "border-fit: overwrite;",
            "bdfof": "border-fit: overflow;",
            "bdfsp": "border-fit: space;",
            "bdlen": "border-length: |;",
            "bdlena": "border-length: auto;",
            "bdsp": "border-spacing: |;",
            "bds": "border-style: |;",
            "bdsn": "border-style: none;",
            "bdsh": "border-style: hidden;",
            "bdsdt": "border-style: dotted;",
            "bdsds": "border-style: dashed;",
            "bdss": "border-style: solid;",
            "bdsdb": "border-style: double;",
            "bdsdtds": "border-style: dot-dash;",
            "bdsdtdtds": "border-style: dot-dot-dash;",
            "bdsw": "border-style: wave;",
            "bdsg": "border-style: groove;",
            "bdsr": "border-style: ridge;",
            "bdsi": "border-style: inset;",
            "bdso": "border-style: outset;",
            "bdw": "border-width: |;",
            "bdtw": "border-top-width: |;",
            "bdrw": "border-right-width: |;",
            "bdbw": "border-bottom-width: |;",
            "bdlw": "border-left-width: |;",
            "bdt": "border-top: |;",
            "bt": "border-top: |;",
            "bdt+": "border-top: ${1:1px} ${2:solid} ${3:#000};",
            "bdtn": "border-top: none;",
            "bdts": "border-top-style: |;",
            "bdtsn": "border-top-style: none;",
            "bdtc": "border-top-color: #${1:000};",
            "bdtct": "border-top-color: transparent;",
            "bdr": "border-right: |;",
            "br": "border-right: |;",
            "bdr+": "border-right: ${1:1px} ${2:solid} ${3:#000};",
            "bdrn": "border-right: none;",
            "bdrst": "border-right-style: |;",
            "bdrstn": "border-right-style: none;",
            "bdrc": "border-right-color: #${1:000};",
            "bdrct": "border-right-color: transparent;",
            "bdb": "border-bottom: |;",
            "bb": "border-bottom: |;",
            "bdb+": "border-bottom: ${1:1px} ${2:solid} ${3:#000};",
            "bdbn": "border-bottom: none;",
            "bdbs": "border-bottom-style: |;",
            "bdbsn": "border-bottom-style: none;",
            "bdbc": "border-bottom-color: #${1:000};",
            "bdbct": "border-bottom-color: transparent;",
            "bdl": "border-left: |;",
            "bl": "border-left: |;",
            "bdl+": "border-left: ${1:1px} ${2:solid} ${3:#000};",
            "bdln": "border-left: none;",
            "bdls": "border-left-style: |;",
            "bdlsn": "border-left-style: none;",
            "bdlc": "border-left-color: #${1:000};",
            "bdlct": "border-left-color: transparent;",
            "bdrs": "border-radius: |;",
            "bdtrrs": "border-top-right-radius: |;",
            "bdtlrs": "border-top-left-radius: |;",
            "bdbrrs": "border-bottom-right-radius: |;",
            "bdblrs": "border-bottom-left-radius: |;",
            "bg": "background: |;",
            "bg+": "background: ${1:#fff} url(${2}) ${3:0} ${4:0} ${5:no-repeat};",
            "bgn": "background: none;",
            "bgie": "filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src='${1:x}.png',sizingMethod='${2:crop}');",
            "bgc": "background-color: #${1:fff};",
            "bgct": "background-color: transparent;",
            "bgi": "background-image: url(|);",
            "bgin": "background-image: none;",
            "bgr": "background-repeat: |;",
            "bgrn": "background-repeat: no-repeat;",
            "bgrx": "background-repeat: repeat-x;",
            "bgry": "background-repeat: repeat-y;",
            "bgrsp": "background-repeat: space;",
            "bgrrd": "background-repeat: round;",
            "bga": "background-attachment: |;",
            "bgaf": "background-attachment: fixed;",
            "bgas": "background-attachment: scroll;",
            "bgp": "background-position: ${1:0} ${2:0};",
            "bgpx": "background-position-x: |;",
            "bgpy": "background-position-y: |;",
            "bgbk": "background-break: |;",
            "bgbkbb": "background-break: bounding-box;",
            "bgbkeb": "background-break: each-box;",
            "bgbkc": "background-break: continuous;",
            "bgcp": "background-clip: ${1:padding-box};",
            "bgcpbb": "background-clip: border-box;",
            "bgcppb": "background-clip: padding-box;",
            "bgcpcb": "background-clip: content-box;",
            "bgcpnc": "background-clip: no-clip;",
            "bgo": "background-origin: |;",
            "bgopb": "background-origin: padding-box;",
            "bgobb": "background-origin: border-box;",
            "bgocb": "background-origin: content-box;",
            "bgsz": "background-size: |;",
            "bgsza": "background-size: auto;",
            "bgszct": "background-size: contain;",
            "bgszcv": "background-size: cover;",
            "c": "color: #${1:000};",
            "cr": "color: rgb(${1:0}, ${2:0}, ${3:0});",
            "cra": "color: rgba(${1:0}, ${2:0}, ${3:0}, .${4:5});",
            "cm": "/*  |${child} */",
            "cnt": "content:' |';",
            "cntn": "content: normal;",
            "cntoq": "content: open-quote;",
            "cntnoq": "content: no-open-quote;",
            "cntcq": "content: close-quote;",
            "cntncq": "content: no-close-quote;",
            "cnta": "content: attr(|);",
            "cntc": "content: counter(|);",
            "cntcs": "content: counters(|);",


            "tbl": "table-layout: |;",
            "tbla": "table-layout: auto;",
            "tblf": "table-layout: fixed;",
            "cps": "caption-side: |;",
            "cpst": "caption-side: top;",
            "cpsb": "caption-side: bottom;",
            "ec": "empty-cells: |;",
            "ecs": "empty-cells: show;",
            "ech": "empty-cells: hide;",
            "lis": "list-style: |;",
            "lisn": "list-style: none;",
            "lisp": "list-style-position: |;",
            "lispi": "list-style-position: inside;",
            "lispo": "list-style-position: outside;",
            "list": "list-style-type: |;",
            "listn": "list-style-type: none;",
            "listd": "list-style-type: disc;",
            "listc": "list-style-type: circle;",
            "lists": "list-style-type: square;",
            "listdc": "list-style-type: decimal;",
            "listdclz": "list-style-type: decimal-leading-zero;",
            "listlr": "list-style-type: lower-roman;",
            "listur": "list-style-type: upper-roman;",
            "lisi": "list-style-image: |;",
            "lisin": "list-style-image: none;",
            "q": "quotes: |;",
            "qn": "quotes: none;",
            "qru": "quotes: '\\00AB' '\\00BB' '\\201E' '\\201C';",
            "qen": "quotes: '\\201C' '\\201D' '\\2018' '\\2019';",
            "ct": "content: |;",
            "ctn": "content: normal;",
            "ctoq": "content: open-quote;",
            "ctnoq": "content: no-open-quote;",
            "ctcq": "content: close-quote;",
            "ctncq": "content: no-close-quote;",
            "cta": "content: attr(|);",
            "ctc": "content: counter(|);",
            "ctcs": "content: counters(|);",
            "coi": "counter-increment: |;",
            "cor": "counter-reset: |;",
            "va": "vertical-align: ${1:top};",
            "vasup": "vertical-align: super;",
            "vat": "vertical-align: top;",
            "vatt": "vertical-align: text-top;",
            "vam": "vertical-align: middle;",
            "vabl": "vertical-align: baseline;",
            "vab": "vertical-align: bottom;",
            "vatb": "vertical-align: text-bottom;",
            "vasub": "vertical-align: sub;",
            "tea": "text-align: ${1:left};",
            "tal": "text-align: left;",
            "tac": "text-align: center;",
            "tar": "text-align: right;",
            "taj": "text-align: justify;",
            "ta-lst": "text-align-last: |;",
            "tala": "text-align-last: auto;",
            "tall": "text-align-last: left;",
            "talc": "text-align-last: center;",
            "talr": "text-align-last: right;",
            "td": "text-decoration: ${1: none};",
            "tdn": "text-decoration: none;",
            "tdu": "text-decoration: underline;",
            "tdo": "text-decoration: overline;",
            "tdl": "text-decoration: line-through;",
            "te": "text-emphasis: |;",
            "ten": "text-emphasis: none;",
            "teac": "text-emphasis: accent;",
            "tedt": "text-emphasis: dot;",
            "tec": "text-emphasis: circle;",
            "teds": "text-emphasis: disc;",
            "teb": "text-emphasis: before;",
            "tema": "text-emphasis: after;",
            "th": "text-height: |;",
            "tha": "text-height: auto;",
            "thf": "text-height: font-size;",
            "tht": "text-height: text-size;",
            "thm": "text-height: max-size;",
            "ti": "text-indent: |;",
            "ti:-": "text-indent: -9999px;",
            "tj": "text-justify: |;",
            "tja": "text-justify: auto;",
            "tjiw": "text-justify: inter-word;",
            "tjii": "text-justify: inter-ideograph;",
            "tjic": "text-justify: inter-cluster;",
            "tjd": "text-justify: distribute;",
            "tjk": "text-justify: kashida;",
            "tjt": "text-justify: tibetan;",
            "tov": "text-overflow: ${ellipsis};",
            "tove": "text-overflow: ellipsis;",
            "tovc": "text-overflow: clip;",
            "to": "text-outline: |;",
            "to+": "text-outline: ${1:0} ${2:0} ${3:#000};",
            "ton": "text-outline: none;",
            "tr": "text-replace: |;",
            "trn": "text-replace: none;",
            "tt": "text-transform: ${1:uppercase};",
            "ttn": "text-transform: none;",
            "ttc": "text-transform: capitalize;",
            "ttu": "text-transform: uppercase;",
            "ttl": "text-transform: lowercase;",
            "tw": "text-wrap: |;",
            "twn": "text-wrap: normal;",
            "twno": "text-wrap: none;",
            "twu": "text-wrap: unrestricted;",
            "tws": "text-wrap: suppress;",
            "tsh": "text-shadow: ${1:hoff} ${2:voff} ${3:blur} ${4:#000};",
            "tshr": "text-shadow: ${1:h} ${2:v} ${3:blur} rgb(${4:0}, ${5:0}, ${6:0});",
            "tshra": "text-shadow: ${1:h} ${2:v} ${3:blur} rgba(${4:0}, ${5:0}, ${6:0}, .${7:5});",
            "tsh+": "text-shadow: ${1:0} ${2:0} ${3:0} ${4:#000};",
            "tshn": "text-shadow: none;",
            "trf": "transform: |;",
            "trfskx": "transform: skewX(${1:angle});",
            "trfsky": "transform: skewY(${1:angle});",
            "trfsc": "transform: scale(${1:x}, ${2:y});",
            "trfscx": "transform: scaleX(${1:x});",
            "trfscy": "transform: scaleY(${1:y});",
            "trfr": "transform: rotate(${1:angle});",
            "trft": "transform: translate(${1:x}, ${2:y});",
            "trftx": "transform: translateX(${1:x});",
            "trfty": "transform: translateY(${1:y});",
            "trfo": "transform-origin: |;",
            "trfs": "transform-style: ${1:preserve-3d};",
            "trs": "transition: ${1:prop} ${2:time};",
            "trsde": "transition-delay: ${1:time};",
            "trsdu": "transition-duration: ${1:time};",
            "trsp": "transition-property: ${1:prop};",
            "trstf": "transition-timing-function: ${1:tfunc};",
            "lh": "line-height: |;",
            "whs": "white-space: |;",
            "whsn": "white-space: normal;",
            "whsp": "white-space: pre;",
            "whsnw": "white-space: nowrap;",
            "whspw": "white-space: pre-wrap;",
            "whspl": "white-space: pre-line;",
            "whsc": "white-space-collapse: |;",
            "whscn": "white-space-collapse: normal;",
            "whsck": "white-space-collapse: keep-all;",
            "whscl": "white-space-collapse: loose;",
            "whscbs": "white-space-collapse: break-strict;",
            "whscba": "white-space-collapse: break-all;",
            "wob": "word-break: |;",
            "wobn": "word-break: normal;",
            "wobk": "word-break: keep-all;",
            "wobl": "word-break: loose;",
            "wobbs": "word-break: break-strict;",
            "wobba": "word-break: break-all;",
            "wos": "word-spacing: |;",
            "wow": "word-wrap: |;",
            "wownm": "word-wrap: normal;",
            "wown": "word-wrap: none;",
            "wowu": "word-wrap: unrestricted;",
            "wows": "word-wrap: suppress;",
            "lts": "letter-spacing: |;",
            "f": "font: |;",
            "f+": "font: ${1:1em} ${2:Arial, sans-serif};",
            "fw": "font-weight: |;",
            "fwn": "font-weight: normal;",
            "fwb": "font-weight: bold;",
            "fwbr": "font-weight: bolder;",
            "fwlr": "font-weight: lighter;",
            "fs": "font-style: ${italic};",
            "fsn": "font-style: normal;",
            "fsi": "font-style: italic;",
            "fso": "font-style: oblique;",
            "fv": "font-variant: |;",
            "fvn": "font-variant: normal;",
            "fvsc": "font-variant: small-caps;",
            "fz": "font-size: |;",
            "fza": "font-size-adjust: |;",
            "fzan": "font-size-adjust: none;",
            "ff": "font-family: |;",
            "ffs": "font-family: serif;",
            "ffss": "font-family: sans-serif;",
            "ffc": "font-family: cursive;",
            "fff": "font-family: fantasy;",
            "ffm": "font-family: monospace;",
            "fef": "font-effect: |;",
            "fefn": "font-effect: none;",
            "fefeg": "font-effect: engrave;",
            "fefeb": "font-effect: emboss;",
            "fefo": "font-effect: outline;",
            "fem": "font-emphasize: |;",
            "femp": "font-emphasize-position: |;",
            "fempb": "font-emphasize-position: before;",
            "fempa": "font-emphasize-position: after;",
            "fems": "font-emphasize-style: |;",
            "femsn": "font-emphasize-style: none;",
            "femsac": "font-emphasize-style: accent;",
            "femsdt": "font-emphasize-style: dot;",
            "femsc": "font-emphasize-style: circle;",
            "femsds": "font-emphasize-style: disc;",
            "fsm": "font-smooth: |;",
            "fsma": "font-smooth: auto;",
            "fsmn": "font-smooth: never;",
            "fsmaw": "font-smooth: always;",
            "fst": "font-stretch: |;",
            "fstn": "font-stretch: normal;",
            "fstuc": "font-stretch: ultra-condensed;",
            "fstec": "font-stretch: extra-condensed;",
            "fstc": "font-stretch: condensed;",
            "fstsc": "font-stretch: semi-condensed;",
            "fstse": "font-stretch: semi-expanded;",
            "fste": "font-stretch: expanded;",
            "fstee": "font-stretch: extra-expanded;",
            "fstue": "font-stretch: ultra-expanded;",
            "op": "opacity: |;",
            "opie": "filter: progid:DXImageTransform.Microsoft.Alpha(Opacity=100);",
            "opms": "-ms-filter: 'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)';",
            "rsz": "resize: |;",
            "rszn": "resize: none;",
            "rszb": "resize: both;",
            "rszh": "resize: horizontal;",
            "rszv": "resize: vertical;",
            "cur": "cursor: ${pointer};",
            "cura": "cursor:  auto;",
            "curd": "cursor: default;",
            "curc": "cursor: crosshair;",
            "curha": "cursor: hand;",
            "curhe": "cursor: help;",
            "curm": "cursor: move;",
            "curp": "cursor: pointer;",
            "curt": "cursor: text;",
            "pgbb": "page-break-before: |;",
            "pgbbau": "page-break-before: auto;",
            "pgbbal": "page-break-before: always;",
            "pgbbl": "page-break-before: left;",
            "pgbbr": "page-break-before: right;",
            "pgbi": "page-break-inside: |;",
            "pgbiau": "page-break-inside: auto;",
            "pgbiav": "page-break-inside: avoid;",
            "pgba": "page-break-after: |;",
            "pgbaau": "page-break-after: auto;",
            "pgbaal": "page-break-after: always;",
            "pgbal": "page-break-after: left;",
            "pgbar": "page-break-after: right;",
            "orp": "orphans: |;",
            "us": "user-select: ${none};",
            "wid": "widows: |;",
            "wfsm": "-webkit-font-smoothing: ${antialiased};",
            "wfsma": "-webkit-font-smoothing: antialiased;",
            "wfsms": "-webkit-font-smoothing: subpixel-antialiased;",
            "wfsmsa": "-webkit-font-smoothing: subpixel-antialiased;",
            "wfsmn": "-webkit-font-smoothing: none;"

        },
        "html": {
            "c": "<!-- ${child} -->",
            "cc:ie6": "<!--[if lte IE 6]>\n\t${child}\n<![endif]-->",
            "ccie": "<!--[if IE]>\n\t${child}\n<![endif]-->",
            "ccnoie": "<!--[if !IE]><!-->\n\t${child}\n<!--<![endif]-->",
            "!": "<!doctype html>\n<html lang='${en}'>\n<head>\n\t<meta charset='UTF-8'>\n\t<title>${title}</title>\n</head>\n<body>\n\t|\n</body>\n</html>",
            "a": "<a href=\" |\">",
            "alink": "<a href=\"http:// |\">",
            "amail": "<a href=\"mailto: |\">",
            "abbr": "<abbr title=\" |\">",
            "acronym": "<acronym title=\" |\">",
            "base": "<base href=\" |\" />",
            "basefont": "<basefont/>",
            "br": "<br/>",
            "frame": "<frame/>",
            "hr": "<hr/>",
            "bdo": "<bdo dir=\" |\">",
            "bdor": "<bdo dir=\"rtl\">",
            "bdol": "<bdo dir=\"ltr\">",
            "col": "<col/>",
            "link": "<link rel=\"stylesheet\" href=\" |\" />",
            "linkcss": "<link rel=\"stylesheet\" href=\"${1:style}.css\" media=\"all\" />",
            "linkprint": "<link rel=\"stylesheet\" href=\"${1:print}.css\" media=\"print\" />",
            "linkfavicon": "<link rel=\"shortcut icon\" type=\"image/x-icon\" href=\"${1:favicon.ico}\" />",
            "linktouch": "<link rel=\"apple-touch-icon\" href=\"${1:favicon.png}\" />",
            "linkrss": "<link rel=\"alternate\" type=\"application/rss+xml\" title=\"RSS\" href=\"${1:rss.xml}\" />",
            "linkatom": "<link rel=\"alternate\" type=\"application/atom+xml\" title=\"Atom\" href=\"${1:atom.xml}\" />",
            "meta": "<meta/>",
            "metautf": "<meta http-equiv=\"Content-Type\" content=\"text/html;charset=UTF-8\" />",
            "metawin": "<meta http-equiv=\"Content-Type\" content=\"text/html;charset=windows-1251\" />",
            "metavp": "<meta name=\"viewport\" content=\"width=${1:device-width}, user-scalable=${2:no}, initial-scale=${3:1.0}, maximum-scale=${4:1.0}, minimum-scale=${5:1.0}\" />",
            "metacompat": "<meta http-equiv=\"X-UA-Compatible\" content=\"${1:IE=7}\" />",
            "style": "<style>",
            "script": "<script>",
            "scriptsrc": "<script src=\"\">",
            "img": "<img src=\"\" alt=\"\" />",
            "iframe": "<iframe src=\"\" frameborder=\"0\">",
            "embed": "<embed src=\"\" type=\"\" />",
            "object": "<object data=\"\" type=\"\">",
            "param": "<param name=\"\" value=\"\" />",
            "map": "<map name=\"\">",
            "area": "<area shape=\"\" coords=\"\" href=\"\" alt=\"\" />",
            "aread": "<area shape=\"default\" href=\"\" alt=\"\" />",
            "areac": "<area shape=\"circle\" coords=\"\" href=\"\" alt=\"\" />",
            "arear": "<area shape=\"rect\" coords=\"\" href=\"\" alt=\"\" />",
            "areap": "<area shape=\"poly\" coords=\"\" href=\"\" alt=\"\" />",
            "form": "<form action=\"\">",
            "formget": "<form action=\"\" method=\"get\">",
            "formpost": "<form action=\"\" method=\"post\">",
            "label": "<label for=\"\">",
            "input": "<input type=\"${1:text}\" />",
            "inp": "<input type=\"${1:text}\" name=\"\" id=\"\" />",
            "inputhidden": "input[type=hidden name]",
            "inputh": "inputhidden",
            "inputtext": "inp",
            "inputt": "inp",
            "inputsearch": "inp[type=search]",
            "inputemail": "inp[type=email]",
            "inputurl": "inp[type=url]",
            "inputpassword": "inp[type=password]",
            "inputp": "inputpassword",
            "inputdatetime": "inp[type=datetime]",
            "inputdate": "inp[type=date]",
            "input:datetime-local": "inp[type=datetime-local]",
            "inputmonth": "inp[type=month]",
            "inputweek": "inp[type=week]",
            "inputtime": "inp[type=time]",
            "inputnumber": "inp[type=number]",
            "inputcolor": "inp[type=color]",
            "inputcheckbox": "inp[type=checkbox]",
            "inputc": "inputcheckbox",
            "inputradio": "inp[type=radio]",
            "inputr": "inputradio",
            "inputrange": "inp[type=range]",
            "inputfile": "inp[type=file]",
            "inputf": "inputfile",
            "inputsubmit": "<input type=\"submit\" value=\"\" />",
            "inputs": "inputsubmit",
            "inputimage": "<input type=\"image\" src=\"\" alt=\"\" />",
            "inputi": "inputimage",
            "inputbutton": "<input type=\"button\" value=\"\" />",
            "inputb": "inputbutton",
            "isindex": "<isindex/>",
            "inputreset": "input:button[type=reset]",
            "select": "<select name=\"\" id=\"\">",
            "option": "<option value=\"\">",
            "textarea": "<textarea name=\"\" id=\"\" cols=\"${1:30}\" rows=\"${2:10}\">",
            "menucontext": "menu[type=context]>",
            "menuc": "menucontext",
            "menutoolbar": "menu[type=toolbar]>",
            "menut": "menutoolbar",
            "video": "<video src=\"\">",
            "audio": "<audio src=\"\">",
            "htmlxml": "<html xmlns=\"http://www.w3.org/1999/xhtml\">",
            "keygen": "<keygen/>",
            "command": "<command/>",

            "bq": "blockquote",
            "acr": "acronym",
            "fig": "figure",
            "figc": "figcaption",
            "ifr": "iframe",
            "emb": "embed",
            "obj": "object",
            "src": "source",
            "cap": "caption",
            "colg": "colgroup",
            "fst": "fieldset",
            "btn": "button",
            "btnb": "button[type=button]",
            "btnr": "button[type=reset]",
            "btns": "button[type=submit]",
            "optg": "optgroup",
            "opt": "option",
            "tarea": "textarea",
            "leg": "legend",
            "sect": "section",
            "art": "article",
            "hdr": "header",
            "ftr": "footer",
            "adr": "address",
            "dlg": "dialog",
            "str": "strong",
            "prog": "progress",
            "fset": "fieldset",
            "datag": "datagrid",
            "datal": "datalist",
            "kg": "keygen",
            "out": "output",
            "det": "details",
            "cmd": "command",
            "doc": "html>(head>meta[charset=UTF-8]+title{${1:Document}})+body",
            "doc4": "html>(head>meta[http-equiv=\"Content-Type\" content=\"text/html;charset=${charset}\"]+title{${1:Document}})",

            "ol+": "ol>li",
            "ul+": "ul>li",
            "dl+": "dl>dt+dd",
            "map+": "map>area",
            "table+": "table>tr>td",
            "colgroup+": "colgroup>col",
            "colg+": "colgroup>col",
            "tr+": "tr>td",
            "select+": "select>option",
            "optgroup+": "optgroup>option",
            "optg+": "optgroup>option"
        }
    };
    
    const log = require('ko/logging').getLogger('xemmet');
    log.setLevel(require('ko/logging').LOG_DEBUG);
    
    this.load = () => {};
    
    this.unload = () => {};
    
    this._getUserSnippet = (lang, snippet) => {
        var part = ko.abbrev.findAbbrevSnippet("xemmet_" + snippet, null, lang);
        if (part !== null) return {snippet: true, name: "xemmet_" + snippet, data: part, user: true, length: snippet.length};
        return {snippet: false};
    };
    
    this.get = (l, s) => this.getSnippet(l, s);
    
    this.getUserSnippets = () => userSnippets;
    
    this._getBuilinSnippetRecursive = (lang, snippet) => {
        var finalSnippet = false;
        if (lang in snippets) {
            if (snippet in snippets[lang]) {
                if (require('xemmet/xemmet').prefs.getBool("xemmet_recursive_search", false))
                {
                    finalSnippet = this._getBuilinSnippetRecursive(lang, snippets[lang][snippet]) || snippets[lang][snippet];
                } else
                {
                    finalSnippet = snippets[lang][snippet];
                }
            }
        }
        return finalSnippet;
    };
    
    this.getSnippet = (language, snippet) => {
        var usnippet = this._getUserSnippet(language, snippet);
        var _snippet = false;
        
        if (usnippet.snippet !== false) return usnippet;
        _snippet = this._getBuilinSnippetRecursive(language, snippet);
        if (_snippet) {
            return {snippet: true, name: snippet, data: _snippet, user: false, length: snippet.length};
        }
        return {snippet: false};
    };
}).apply(module.exports);