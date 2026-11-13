/**
 * Compact built-in dataset: one line per emoji, `base|name|keywords…|tonePositions?`.
 * Parsed once per page load and shared by every picker instance. Skin tone positions mark
 * single-cluster emoji (hands, feet, people) that take a tone modifier; ZWJ sequences skip tones.
 */

export interface EmojiEntry {
  /** The base sequence without a skin tone modifier; what gets stored as "recent". */
  base: string;
  name: string;
  keywords: string;
  tonePositions: number;
  /** Precomputed lowercase haystack for search. */
  lower: string;
}

export interface EmojiSection {
  id: string;
  name: string;
  icon: string;
  items: EmojiEntry[];
}

/** Applies a skin tone to a base emoji. 0 returns the base unchanged; 1 to 5 go light to dark. */
export function applyTone(base: string, tone: number): string {
  if (tone <= 0) return base;
  const modifier = String.fromCodePoint(0x1f3fb + Math.min(4, Math.max(0, tone - 1)));
  // A trailing variation selector stays last so the modifier lands before it.
  if (base.endsWith("\uFE0F")) return base.slice(0, -1) + modifier + "\uFE0F";
  return base + modifier;
}

const RAW = `smileys-and-people|Smileys and people|😄
😀|grinning face|smile happy joy
😃|grinning wide|joy laughing
😄|grinning squints|laughing happy
😁|beaming grin|grin teeth smile
😆|grinning sweat|laughing hard
😅|beaming cold sweat|nervous laugh
🤣|rolling on floor|lol laughing crying
😂|tears of joy|lol funny crying
😊|smiling blush|shy happy warm
😇|smiling halo|angel good blessed
🙂|slightly smiling|ok neutral pleasant
😉|winking|flirt playful
😍|heart eyes|love crush starstruck
🥰|smiling hearts|love affectionate
😘|face blowing kiss|smooch love
😗|kissing closed|kiss love
😚|kissing blush|kiss sweet
😙|kissing smiling|kiss love
☺️|relaxed face|smile content
😛|tongue out side|silly joking
😜|winking tongue|playful silly
🤪|zany face|crazy funny wild
😝|relieved tongue|oops mischievous
🤑|money mouth|rich cash greedy
🤗|hugging face|hug warm cozy
🤭|hand over mouth|giggling shy
🤫|shushing|hush quiet secret
🤔|thinking face|hmm ponder considering
🤐|zipper mouth|quiet silent closed
🤨|raised eyebrow|skeptical doubtful
😐|neutral face|blank meh unimpressed
😑|expressionless|meh blank
😶|face without mouth|silent blank poker
😏|smirking|smirk confident sly
😒|unamused|bored annoyed skeptic
😞|disappointed|sad down letdown
😔|pensive|sad reflecting
😟|worried|concerned anxious
😕|confused|unclear puzzling
🙁|frowning open|sad unhappy
😣|persevering|struggling effortful
😖|confounded|worried tangled
😫|weary face|tired exhausted sigh
😩|screaming in relief|exhausted done
🥺|pleading|puppy eyes cutesy
😢|crying face|tear sad
😭|loudly sobbing|crying upset
😤|triumph|huff steam smug
😠|frowning angry|mad irritated
😡|pouting furious|angry rage
🤯|exploding head|mind blown shocked
😳|flushed|embarrassed blushing
🥵|hot face|warm sweating attracted
🥶|cold face|freezing chilly
😱|screaming in fear|scared shocked
😨|fearful|scared terrified
😰|anxious sweat|nervous worried
😥|sad with relief|tear relieved
🤤|drooling|mouth hungry excited
😴|sleeping|zzz nap tired
😷|with mask|sick ill cold
🤒|fever face|sick burning
🤕|head with bandage|ouch hurt
🤢|nauseated|sick queasy
🤮|vomiting|puke throwing up
🤧|sneezing|achoo sneeze
🥴|woozy|dizzy drunk wobbly
🤠|cowboy hat|western bandana
🥳|partying|celebrate birthday hat
😎|sunglasses|cool shades
🤓|nerd face|geek smart glasses
🧐|monocle|inspecting fancy
🫡|saluting|respect salute
😈|grinning devil|imp mischievous
👿|angry devil|mad imp
🤡|clown face|fool funny
💩|pile of poo|shit poop dung
👻|ghost|boo haunted spooky
💀|skull|dead skeleton
🤖|robot|bot machine android
🎃|jack o lantern|halloween pumpkin
👋|waving hand|hand hello wave bye|1
👍|thumbs up|like yes agree|1
👎|thumbs down|no dislike bad|1
👌|pinched fingers|okay fine perfect|1
🤌|pinching fingers|italian small|1
🤏|pinched fingers|tiny small|1
✌️|victory hand|peace okay sign|1
🤞|crossed fingers|hope luck wish|1
🤟|love you gesture|rock metal hand|1
🤘|sign of horns|metal rock devil|1
🤙|call me hand|shaka hang loose|1
👈|pointing back|finger left previous|1
👉|pointing next|finger right|1
☝️|pointing up|finger index above|1
👆|pointing up|finger top|1
👇|pointing down|finger bottom|1
🫵|pointing you|finger you|1
🖖|vulcan salute|spock star trek|1
🫰|pinched heart|love gesture|1
✍️|writing hand|pen sign|1
💪|flexed biceps|strong muscle arm|1
🫶|heart hands|love affection|1
🫷|open hands together|welcoming|1
👏|clapping hands|applause praise clap|1
🙌|raising hands|praise hooray high five|1
👐|open hands|welcome receiving|1
🤲|palms up together|begging praying open|1
🤝|handshake|deal agreement partnership|1
🙏|folded hands|pray please thanks|1
👊|raised fist|bump power salute|1
🤛|left fist|fingers crossed|1
🤜|right fist|fingers crossed|1
🦾|mechanical arm|robot bionic
🦵|leg|thigh shin|1
🦶|foot|toe step|1
👂|ear|hear listen hearing
🦻|deaf ear|hearing aid
👃|nose|smell sniff
👀|eyes|looking see staring
👁️|eye|watch observe
👅|tongue|taste lick
👄|lips|mouth kiss
🧠|brain|smart mind thinking
👶|baby|newborn toddler|1
🧒|child|kid young|1
👦|boy|son male kid|1
👧|girl|daughter female kid|1
🧑|adult person|human figure
👨|man|male dad|1
👩|woman|female lady|1
🧓|older adult|senior grey|1
👴|old man|grandpa senior|1
👵|old woman|grandma senior|1
🙍|person frowning|skeptical|1
🙎|person gesturing no|unimpressed|1
🙅|person gesturing no|not against|1
🙆|person gesturing ok|fine cool|1
🤷|shrugging|no idea whatever|1
🤦|facepalm|frustrated groan|1
🕺|man dancing|disco groove|1
💃|woman dancing|disco dance|1
🏃|person running|jog sprint exercise|1
🧗|person climbing|rock mountain|1
🧘|person lotus position|yoga meditation calm|1
🏋️|person lifting weights|gym muscle|1
🤸|cartwheeling|gymnastics flip|1
🤺|person fencing|sword duel|1
🧍|person standing|upright|1
🧎|person kneeling|praying bow|1
🛀|person taking bath|shower tub|1
💁|person tipping hair|information|1
💅|person nail polish|manicure beauty|1
👮|police officer|cop constable|1
👷|construction worker|helmet builder|1
💂|guard|sentinel british|1
🤵|person in tuxedo|formal suit|1
👰|bride|wedding dress|1
👸|princess|crown fairytale|1
🤴|prince|crown royal|1
👼|baby angel|halo cherub
🎅|santa claus|xmas christmas|1
🤶|mrs claus|santa wife christmas
🦸|superhero|cape hero|1
🦹|supervillain|cape evil|1
🧙|mage|wizard wizard hat|1
🧝|elf|pointy ears fantasy|1
🧞|genie|lamp wish|1
🧟|zombie|undead undead|1
animals-and-nature|Animals and nature|🐶
🐶|dog face|puppy mutt
🐱|cat face|kitten kitty
🐭|mouse face|rodent squeak
🐹|hamster|pet fluffy
🐰|rabbit face|bunny hop
🦊|fox|red fox cunning
🐻|bear face|honey teddy
🐼|panda face|bamboo china
🐨|koala|eucalyptus aussie
🐯|tiger face|stripes jungle
🦁|lion|king savanna
🐮|cow face|moo dairy
🐷|pig face|hog snout oink
🐸|frog|croak swamp
🐵|monkey face|chimp banana
🙈|see no evil monkey|monkeys cover eyes
🙉|hear no evil monkey|monkeys ears
🙊|speak no evil monkey|monkeys mouth
🐔|chicken|hen cluck rooster
🐧|penguin|tuxedo antarctica
🐦|bird|tweet song
🐤|baby chick|newborn bird
🦆|duck|quack swim
🦅|eagle|falcon hawk
🦉|owl|hoot night bird
🦇|bat|vampire flying
🐺|wolf|howl grey
🐗|boar|pig tusks
🐴|horse face|stallion pony
🦄|unicorn|magical horn fantasy
🐝|honeybee|buzz pollen
🐛|caterpillar|worm larvae
🦋|butterfly|moth wings
🐌|snail|slow shell
🐞|lady beetle|bug red spots
🦟|mosquito|buzz bite
🦐|shrimp|seafood prawn
🦀|crab|shellfish legs
🦞|lobster|seafood claws
🦏|rhinoceros|horn horned
🐙|octopus|tentacles cephalopod
🦑|squid|cephalopod ink
🦈|shark|fin great white
🐬|dolphin|flipper ocean
🐳|whale|spout ocean
🐋|whale spouting|baleen ocean
🐊|crocodile|alligator reptile
🦓|zebra|stripes safari
🦍|gorilla|ape silverback
🐘|elephant|trunk tusks
🦛|hippopotamus|hippo river
🦒|giraffe|long neck savanna
🐐|goat|horn bleat
🐑|sheep|wool lamb
🐫|camel|hump desert
🦘|kangaroo|joey aussie
🐾|paw prints|tracks animal
🌵|cactus|desert succulent
🎄|christmas tree|xmas fir
🌲|evergreen tree|pine fir
🌳|deciduous tree|leafy branch
🌴|palm tree|tropical beach
🌱|seedling|sprout plant grow
🌿|herb|leaf weed green
☘️|shamrock|celtic clover
🍀|four leaf clover|luck
🪴|potted plant|houseplant pot
🍃|leaves fluttering|fall blowing
🍂|fallen leaf|autumn brown
🍁|maple leaf|canada autumn
🍄|mushroom|fungi toadstool
🌸|cherry blossom|sakura spring
🌼|blossom|daisy yellow flower
🌻|sunflower|yellow flower
🌹|rose|red flower valentine
🥀|wilted rose|fading thorns
🪷|lotus|meditation flower
🌺|hibiscus|tropical flower
🌷|tulip|spring flower holland
🌍|globe europe africa|world earth map
🌎|globe americas|world earth
🌏|globe asia|world earth
🌕|full moon face|lunar bright
🌘|waning crescent moon|lunar dark
🌑|new moon|dark lunar
🌒|waxing crescent|moon dark
🌓|first quarter moon|half moon
🌙|crescent moon|night lunar
⭐|star|sparkle favorite
🌟|glowing star|sparkle
✨|sparkles|shine glimmer magic
⚡|high voltage|lightning zap bolt
☄️|comet|meteor space
💫|dizzy|star hit sparkle
🔥|fire|flame hot burn
🌈|rainbow|arc prism colors
☀️|sun|bright daytime
🌤️|sun behind cloud|partly sunny
⛅|partly cloudy|sun cloud
🌥️|cloud with sun|overcast
☁️|cloud|sky weather
🌧️|rain cloud|raining wet
⛈️|thunder cloud|storm lightning
❄️|snowflake|winter frozen
☃️|snowman|winter cold
💨|dashing away|wind whoosh air
💧|droplet|water drop rain
🌊|water wave|ocean swell sea
food-and-drink|Food and drink|🍔
🍏|green apple|fruit orchard
🍎|red apple|fruit snack
🍐|pear|fruit
🍊|tangerine|orange citrus
🍋|lemon|citrus yellow
🍌|banana|fruit peel
🍉|watermelon|melon summer
🍇|grapes|wine fruit
🍓|strawberry|berry fruit
🫐|blueberries|berry fruit
🍈|melon|cantaloupe
🍒|cherries|cherry fruit pair
🍑|peach|fruit nectarine
🥭|mango|tropical fruit
🍍|pineapple|tropical fruit spiky
🥥|coconut|palm tropical
🥝|kiwi|berry fuzzy
🍅|tomato|vegetable sauce
🍆|eggplant|aubergine purple vegetable
🥑|avocado|guacamole
🥦|broccoli|veggie green
🥒|cucumber|pickle veggie
🌶️|hot pepper|chili spicy
🌽|ear of corn|maize veggie
🥕|carrot|veggie orange
🧄|garlic|spice bulb
🧅|onion|spice tear
🥔|potato|spud fries veggie
🍠|roasted sweet potato|yam mash
🥐|croissant|pastry french bread
🥯|bagel|torso bagel bagels
🍞|bread|loaf bakery
🥖|baguette|french bread stick
🥨|pretzel|twisted snack
🧀|cheese wedge|dairy cheddar
🥚|egg|breakfast omelet
🍳|cooking egg|fried breakfast
🧈|butter|dairy
🥞|pancakes|stack breakfast syrup
🍫|chocolate bar|cocoa sweet
🍿|popcorn|movie snack
🍬|candy|sweet lollipop
🍭|lollipop|sweet swirl
🍮|custard|pudding flan dessert
🍯|honey pot|bee sweet
🥛|glass of milk|drink dairy
☕|hot beverage|coffee tea brew
🍵|teapot|green tea japanese
🍶|sake|rice wine bottle
🍼|baby bottle|milk feeding
🍺|beer mug|ale drink
🍻|clinking beer mugs|cheers toast
🥂|clinking glasses|champagne toast
🍷|glass of wine|red wine glass
🥃|tumbler glass|whiskey bourbon
🧋|bubble tea|milk tea boba
🧃|beverage box|juice carton
🧉|mate|yerba drink
🍔|hamburger|burger fast food
🍟|french fries|fries chips
🍕|pizza|cheese slice pepperoni
🌭|hot dog|frankfurter sausage
🥪|sandwich|sub lunch
🌮|taco|corn tortilla mexican
🌯|burrito|wrapped tortilla
🥙|stuffed flatbread|shawarma gyro
🧆|falafel|bean ball middle east
🥘|shallow pan dish|stew paella
🥫|canned food|tin soup
🍝|spaghetti|pasta italian
🍜|steaming bowl|ramen noodle soup
🍲|pot of food|stew soup
🍛|curry rice|curry fried rice
🍣|sushi|nigiri salmon japanese
🍱|bento box|lunch japanese
🍤|fried shrimp|tempura prawn
🍙|rice ball|onigiri japanese
🍚|cooked rice|porridge bowl
🍥|fish cake swirl|narutomaki
🥟|dumpling|empanada pierogi
🍢|oden|skewers yakitori
🍡|dango|skewered sweet
🥮|moon cake|dessert festival
🍦|soft ice cream|dessert cone
🍨|shaved ice|dessert
🧁|cupcake|dessert cake
🍰|shortcake|slice cake strawberry
🎂|birthday cake|candles celebration
activities|Activities|⚽
⚽|soccer ball|football kick
🏀|basketball|hoop dunk
🏈|american football|rugby american
⚾|baseball|bat homerun
🥎|softball|pitcher diamond
🎾|tennis|racket court
🏐|volleyball|court net
🏉|rugby ball|oval match
🥏|flying disc|frisbee catch
🎱|pool|billiards eight ball
🪀|yo-yo|string toy
🏓|ping pong|table tennis paddle
🏸|badminton|shuttlecock racket
🏒|ice hockey|stick puck
🏑|field hockey|hockey stick
🥅|goal net|soccer goal
⛳|flag in hole|golf
🪁|kite|fly wind
🏹|bow and arrow|archery target
🎣|fishing pole|fish rod
🤿|diving mask|snorkel scuba
🥊|boxing glove|fight punch
🥋|martial arts uniform|karate judo belt
🎽|running shirt|jersey race
🛷|sled|sleigh sleigh winter
🎿|skis|skiing snow
⛸️|ice skate|figure skating
🥌|curling stone|winter olympics
🎯|bullseye|dart target aim
🪃|boomerang|throwback return
🪆|nesting dolls|matryoshka russian
🎮|video game|controller console play
🕹️|joystick|arcade game
🎰|slot machine|gambling casino
🎲|game die|dice roll
🧩|puzzle piece|jigsaw brain
🧸|teddy bear|plush hug
🎭|performing arts|drama theater masks
🎨|artist palette|paint colors design
🎬|clapper board|movie film production
🎤|microphone|sing vocal
🎧|headphone|headphones listen audio
🎼|musical score|notes staff
🎹|musical keyboard|piano keys
🥁|drum|percussion beat
🪕|banjo|string folk
🎷|saxophone|jazz brass
🎺|trumpet|brass blast
🎸|guitar|string rock
🪗|accordion|squeeze piano
🎻|violin|fiddle strings
travel-and-places|Travel and places|✈️
🚗|red car|automobile ride
🚕|taxi|cab cabby
🚙|suv|jeep vehicle
🚌|bus|transit public
🏎️|racing car|formula race
🚓|police car|patrol cruiser
🚑|ambulance|er medical truck
🚒|fire engine|truck ladder
🚐|minibus|van vehicle
🚚|delivery truck|lorry cargo
🚜|tractor|farm vehicle
🛵|scooter|vespa motorbike
🏍️|motorcycle|bike racing
🚲|bicycle|bike cycling
🛴|kick scooter|moped kick
🚨|police light|siren rotating
🚔|oncoming police car|patrol
🚂|locomotive|train rail
🚆|tram train|commuter rail
🚇|metro|subway tube
🚊|tram|streetcar light rail
⚓|anchor|ship harbor
⛵|sailboat|yacht sailing
🚤|speedboat|motorboat cruise
🛥️|motor boat|yacht cruise
🛳️|passenger ship|cruise liner
⛴️|ferry|boat water
🚢|ship|vessel cargo
✈️|airplane|flight jet
🛫|airplane departing|takeoff
🛬|airplane arriving|landing
💺|seat|sit airplane chair
🚁|helicopter|chopper rotor
🚀|rocket|space launch
🛸|flying saucer|ufo alien
🎈|balloon|party helium
🎏|carp streamer|koi festival
🎀|ribbon|bow pink gift
✉️|envelope|letter mail post
📦|package|box shipping parcel
📫|postbox|mailbox letter
🎁|wrapped gift|present present
🎉|party popper|celebration confetti
🎊|confetti ball|party celebration
🏁|chequered flag|finish race checkered
🚩|triangular flag|mark pin
🎌|crossed flags|japan festival
🎐|wind chime|feng shui bell
⛩️|torii gate|shrine japan
🕌|mosque|islamic
🕍|synagogue|jewish temple
⛪|church|christian cathedral
🛕|hindu temple|temple india
🗼|tokyo tower|landmark japan
🗽|statue of liberty|ny liberty
🏰|castle|fortress european
🏯|japanese castle|fortress pagoda
🎡|ferris wheel|carnival
🎢|roller coaster|thrill ride
🎠|carousel horse|merry go round
🏛️|classical building|columns museum
🏗️|building under construction|crane scaffold
🏢|office building|corporation skyscraper
🏬|department store|shopping mall
🏭|factory|industrial plant
🏨|hotel|stay lodging
🏪|convenience store|minimart
💒|wedding|church marriage
🏝️|desert island|sand palm
🏖️|beach with umbrella|sand seaside
🏜️|desert|sand dunes
🌋|volcano|eruption lava
⛰️|mountain|peak hill
🗻|mount fuji|japan landmark
🏔️|snow capped mountain|alps
🏕️|camping|tent campfire
⛺|tent|camping outdoors
🏞️|national park|nature scenic
🌅|sunrise over mountains|morning
🌆|city dusk|skyline evening
🏙️|cityscape|buildings skyline
🌉|bridge at night|bay lights
objects|Objects|💡
⌚|watch|time wrist
📱|mobile phone|smartphone call screen
📲|mobile with arrow|text message
💻|laptop|computer macbook code
⌨️|keyboard|keys type
🖥️|desktop computer|monitor screen
🖨️|printer|paper print
🖱️|computer mouse|click scroll
💾|floppy disk|save storage disk
💿|blue disc|cd dvds optical
📀|dvd|disc cd
📼|videocassette|vhs tape retro
📷|camera|photo snap
📸|camera flash|selfie camera
📹|video camera|recording camcorder
🎥|movie camera|film cinema
📽️|film projector|reel cinema
📞|telephone receiver|call handset
☎️|telephone|dial landline
📟|pager|beeper retro
📠|fax machine|transmit document
📺|television|tv screen
📻|radio|broadcast dial
🎛️|control knobs|dials mixer
⏱️|stopwatch|timer seconds
⌛|hourglass done|time sand
⏳|hourglass not done|time running
⏰|alarm clock|wake ring
🕰️|mantelpiece clock|analog clock
📡|satellite antenna|dish signal
🔋|battery|charge power
🔌|electric plug|power outlet
💡|light bulb|idea bright glow
🔦|flashlight|torch beam
🕯️|candle|flame wax
🪔|diya lamp|oil lamp festival
🧯|fire extinguisher|spray safety
🔮|crystal ball|fortune mystic
🪬|hamsa|hand amulet middle east
📿|prayer beads|rosary mala
🧿|nazar amulet|evil eye bead
🔭|telescope|star space look
🔬|microscope|lab cell
🪞|mirror|reflection looking glass
🗝️|old key|antique unlock
🔑|key|unlock access
🔐|locked with pen|secure
🔒|locked|closed secure padlock
🔓|unlocked|open free
🧲|magnet|attract pull
💣|bomb|explosion war
🧨|firecracker|dynamite sparkler
🪓|axe|chop wood hatchet
🪚|carpentry saw|woodcut
🔩|nut and bolt|hardware wrench
⚙️|gear|cog settings machine
🧱|brick|mortar wall
⛓️|chains|links bind
🧰|toolbox|tools repair
🪛|screwdriver|turn tool
🔧|wrench|plumber tool
🔨|hammer|bang nail tool
⚒️|hammer and pick|forge smith
🛠️|hammer and wrench|tools repair
⛏️|pick|mining dig
🪣|bucket|pail water
🧹|broom|sweep clean
🧺|basket|laundry laundry basket
🧻|toilet paper|roll bathroom
🧼|soap|wash bar
🧽|sponge|scrub kitchen
🪒|razor|shave blade
🪥|toothbrush|dental clean
💊|pill|medicine tablet
💉|syringe|vaccine shot
🩸|drop of blood|medic blood
🩹|adhesive bandage|bandaid plaster cut
🧬|dna|genes helix
🦠|microbe|germ virus bacteria
🧪|test tube|chemistry lab beaker
🧫|petri dish|culture sample
🌡️|thermometer|temperature fever
🧷|safety pin|fasten brooch
🧵|thread|needle sewing
🪡|needle|sew stitch
🧶|yarn|knitting wool
🪢|knot|rope tied
symbols|Symbols|❤️
❤️|red heart|love like
🧡|orange heart|love warm
💛|yellow heart|love friendly
💚|green heart|love nature
💙|blue heart|love calm
💜|purple heart|love royal
🖤|black heart|love dark
🤍|white heart|love pure
🤎|brown heart|love earthy
💔|broken heart|heartbreak sad
❣️|heart exclamation|love decor
💕|two hearts|love like
💞|revolving hearts|in love spin
💓|beating heart|heartbeat pulsating
💗|growing heart|love blooming
💖|sparkling heart|love shine
💘|heart arrow|cupido cupid
💝|heart ribbon|love gift
☮️|peace symbol|dove
✝️|latin cross|christian
☦️|orthodox cross|christian
☪️|star and crescent|islamic
🕉️|om|hindu mantra
☸️|wheel of dharma|buddhist
✡️|star of david|jewish jewish
🕎|menorah|hanukkah candle
☯️|yin yang|balance tao
🆕|new|fresh what
🆒|cool|awesome
🆓|free|no cost
🆔|id|identity
⚛️|atom symbol|physics science
☢️|radioactive|danger radiation
☣️|biohazard|virus danger
📴|mobile phone off|no signal silent
📳|vibrate mode|phone buzz
🌐|globe with meridians|world internet map
💹|chart increasing|stock rising money
❇️|sparkle|shine glitter
✳️|eight pointed star|sparkle flash
✅|check mark button|yes approved
✔️|check mark|yes tick done
☑️|check box with check|selected ballot
❎|crossed square|no x rejected
💯|hundred|perfect full marks
🅰️|ab blood type|red plus
🅱️|b blood type|red
🆎|ott|search magnifier
ℹ️|information|info blue
⚠️|warning|caution attention
🔱|trident emblem|weapon mermaid
🌀|cyclone|swirl whirlpool
⭕|white circle|round zero
🛑|stop sign|octagon red halt
🛟|life buoys|life preserver float
🛡️|shield|armor protect
🚫|no entry|prohibited forbidden
💢|anger mark|mad cross lines
💤|zzz|sleep snooze
💬|speech balloon|chat comment bubble
💭|thought balloon|thinking bubble dream
©️|copyright|legal trademark
®️|registered|legal trademark
™️|trade mark|legal brand
0️⃣|keycap 0|digit number
1️⃣|keycap 1|digit number
2️⃣|keycap 2|digit number
3️⃣|keycap 3|digit number
4️⃣|keycap 4|digit number
5️⃣|keycap 5|digit number
6️⃣|keycap 6|digit number
7️⃣|keycap 7|digit number
8️⃣|keycap 8|digit number
9️⃣|keycap 9|digit number
🔟|keycap ten|digit number
#️⃣|hash key|number hashtag
*️⃣|asterisk key|star sharp
flags|Flags|🇧🇷
🇦🇹|flag austria|country europe
🇧🇷|flag brazil|country
🇨🇦|flag canada|country maple
🇩🇪|flag germany|country
🇪🇸|flag spain|country ibiza
🇫🇷|flag france|country paris
🇮🇸|flag iceland|country
🇮🇹|flag italy|country tricolore
🇯🇵|flag japan|country nippon
🇲🇽|flag mexico|country
🇳🇴|flag norway|country viking
🇵🇹|flag portugal|country
🇰🇷|flag south korea|country
🇸🇪|flag sweden|country
🇨🇭|flag switzerland|country alps
🇹🇷|flag turkey|country
🇺🇦|flag ukraine|country
🇬🇧|flag united kingdom|britain uk
🇺🇸|flag united states|america usa
🇼🇿|flag new zealand|country kiwi
🇿🇦|flag south africa|country
`;

/** Section header lines start with an ascii slug (`smileys|Smileys|😄`); item lines start with the emoji itself. */
function parse(raw: string): EmojiSection[] {
  const sections: EmojiSection[] = [];
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    const [first, name, keywords, tones] = line.split("|");
    if (!first || !name) continue;
    if (/^[a-z][a-z-]*$/i.test(first)) {
      sections.push({ id: first.toLowerCase(), name, icon: (keywords ?? "").trim(), items: [] });
      continue;
    }
    const current = sections[sections.length - 1];
    if (!current) continue;
    current.items.push({
      base: first,
      name,
      keywords: keywords ?? "",
      tonePositions: tones ? parseInt(tones, 10) || 1 : 0,
      lower: `${first} ${name} ${keywords ?? ""}`.toLowerCase(),
    });
  }
  return sections;
}

/** Every category in display order, parsed once at module scope and shared by all pickers. */
export const EMOJI_SECTIONS: EmojiSection[] = parse(RAW);

/** Flat, order-stable list used for search across categories. */
export const ALL_EMOJI: readonly { entry: EmojiEntry; sectionId: string }[] = EMOJI_SECTIONS.flatMap(section => section.items.map(entry => ({ entry, sectionId: section.id })));

/** Popular emoji shown under the first heading until something has been picked. */
export const DEFAULT_RECENT: readonly string[] = [
  "👍", "❤️", "😂", "🎉", "🙏", "🔥", "😊", "👀", "✅",
  "🙌", "💯", "😍", "🤔", "👏", "🚀", "😅", "🥳", "👋",
];

/** Emoji that carry a skin tone modifier for the tone menu. */
export const TONE_HAND = "👋";

export type SkinTone = 0 | 1 | 2 | 3 | 4 | 5;
