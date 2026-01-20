console.log("javascript it is!")

let currentSong = new Audio()
let songs;
let currFolder;

function formatTime(seconds) {
    if(isNaN(seconds)|| seconds < 0){
        return "00:00";
    }
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');
    return `${formattedMins}:${formattedSecs}`;
}

async function getSongs(folder){
    currFolder = folder;

    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    // console.log(response)

    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as)

    songs=[]
    for(let i=0; i<as.length; i++){
        const element = as[i];
        if(element.href.endsWith(".mp3")){
            //  console.log("HREF:", element.href)
             let filename = element.href.split("%5C").pop();
            // songs.push(element.href.split(`${folder}/%5C`)[1])
            songs.push(filename)
        }
    }

        // Showing all song in playlist
    let songUL= document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML=""
    for(const song of songs){
        songUL.innerHTML= songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                
                                <div>${(song || "").replace(/%20/g, " ")}</div>
                                <div>Song Artist</div>
                            </div>
                            <div class="playNow">
                                <span>Play now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }
    // this was being used in place of song replace and all
    // <div>${song.replaceAll("%20", " ")}</div>

    // Play forst song....Removed later
    // var audio = new Audio(songs[0]);
    // audio.play();

    // To get the duration of audio...removed later
    // audio.addEventListener("loadeddata", () => {
    //     let duration = audio.duration;
    //     console.log(audio.duration, audio.currentSrc, audio.currentTime)
    // })

    // Attaching even listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            // console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs;
}

const playMusic = (track, pause=false)=>{
    // let audio = new Audio("/songs/"+track)
    currentSong.src = `/${currFolder}/` + track
    if(!pause){
        currentSong.play()
        play.src="img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML= decodeURI(track)
    document.querySelector(".songtime").innerHTML= "00:00/00:00"
}

async function displayAlbum(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    // console.log(div);
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    // Array.from(anchors).forEach(async e=>{
    let array = Array.from(anchors)
    for(let index=0; index<array.length; index++){
        const e = array[index];
        // console.log(e.href)
        if(e.href.includes("songs")){
            let folder = (e.href.split("%5C").slice(-1)[0].replace(/\/$/, ""))
            // Get the metadata of teh folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response)

            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <!-- <i class="hgi hgi-stroke hgi-play play"></i> -->
                        <div class="play">
                            <svg  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                <polygon points="10,8 16,12 10,16" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="Image">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // load the playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            // console.log(item.currentTarget, item.currentTarget.dataset)
            // songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            // songs declaration in above line is commented and below line is used AND return songs is also commented in getSongs function. Both work for same
            await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0])
        })
        
    })
}

async function main(){
    // songs = await getSongs("songs/ncs")
    await getSongs("songs/Jazz")
    // console.log(songs)

    playMusic(songs[0], true)


    await displayAlbum()

    // Attaching even listener to play, pause, next and previous
    play.addEventListener("click", ()=>{
        if(currentSong.paused){
            currentSong.play()
            play.src= "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src="img/play.svg"
        }
    })

    previous.addEventListener("click", ()=>{
        currentSong.pause()
        // console.log("previous clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // let index = songs.indexOf(currentSong.src.split("%5C").pop())
        if((index-1) >=0) {
            playMusic(songs[index-1])
        }

    })
}
    next.addEventListener("click", ()=>{
        currentSong.pause()
        // console.log("next clicked")
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        // let index = songs.indexOf(currentSong.src.split("%5C").pop())
        if((index+1) < songs.length) {
            playMusic(songs[index+1])
        }
    })

    currentSong.addEventListener("ended", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1]);
        }
    });

    currentSong.addEventListener("timeupdate", ()=>{
        // console.log(currentSong.currentTime, currentSong.duration)
        document.querySelector(".songtime").innerHTML=`${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration)*100 +"%"
    })

    document.querySelector(".seekbar").addEventListener("click", e=>{
        // console.log(e.target.getBoundingClientRect().width, e.offsetX)
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) *100
        document.querySelector(".circle").style.left= percent + "%"
        currentSong.currentTime= (currentSong.duration * percent)/100
    })

    document.querySelector(".hamburger").addEventListener("click", e => {
        document.querySelector(".left").style.left = "0"
        // document.querySelector(".right").style.width = "75vw"
        // document.querySelector(".right").style.left = "25vw"
    })

    document.querySelector(".close").addEventListener("click", e =>{
        document.querySelector(".left").style.left= "-120%"
    })

    // even listener for volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
    if (currentSong.volume > 0){
        document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg", "volume.svg")
    }
})

document.querySelector(".volume>img").addEventListener("click", e=>{ 
    if(e.target.src.includes("volume.svg")){
        e.target.src = e.target.src.replace("volume.svg", "mute.svg")
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
    }
    else{
        e.target.src = e.target.src.replace("mute.svg", "volume.svg")
        currentSong.volume = .10;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
    }
})



main()
