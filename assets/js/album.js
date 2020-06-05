$(window).on('load', function() {

    const LIMIT = 8

    // A gloabl variable to hold a dictionary of JSON album objects
    // This implementation avoid the need of using JSON local storage
    var albumJSONDict = {}

    // Get the div to render albums
    let albumMountPoint = document.getElementById("album")

    function renderAlbum(albumId, albumJSON) {

        // Create a gallery for current album
        let albumContainer = document.createElement("div")
        albumContainer.id = `albumContainer-${albumId}`
        albumContainer.className = "my-3 container-fluid"
        albumMountPoint.appendChild(albumContainer)

        // Create album heading
        let hr = document.createElement("hr")
        let albumHeading = document.createElement("h2")
        let albumDataId = document.createElement("a")
        albumDataId.href = `#${albumJSON["albumName"].replace(" ", "-").toLowerCase()}`
        albumDataId.text = albumJSON["albumName"]
        albumHeading.append(albumDataId)
        albumContainer.append(albumHeading)
        albumContainer.append(hr)

        // Create a gallery container
        let galleryContainer = document.createElement("div")
        galleryContainer.id = `galleryContainer-${albumId}`
        galleryContainer.className = "container-fluid"
        albumContainer.appendChild(galleryContainer)

        // Create a button to load remaining images
        let loadMoreButton = document.createElement("button")
        loadMoreButton.id = `loadMoreButton-${albumId}`
        loadMoreButton.innerHTML = "LOAD MORE"
        loadMoreButton.setAttribute("class", "mt-3 btn btn-primary")
        loadMoreButton.setAttribute("data-id", albumId)
        loadMoreButton.onclick = loadImages

        // Create a button wrapper
        let buttonWrapper = document.createElement("div")
        buttonWrapper.className = "d-flex justify-content-center"

        buttonWrapper.appendChild(loadMoreButton)
        albumContainer.appendChild(buttonWrapper)
        
        // Render a gallery
        renderGallery(albumId)
    }

    function renderGallery(albumId, limit = LIMIT) {

        // Retrieve a JSON image array from a particular album
        imgArray = albumJSONDict[albumId]['imgArray']

        // Get the corresponding album gallery for images rendering
        galleryContainer = document.getElementById(`galleryContainer-${albumId}`)
        
        // Set column count to 4,
        // calculate the amount of rows to render
        let cols = 4
        let rows = Math.ceil(imgArray.length / cols)

        // Start rendering images to the gallery
        counter = 0
        for (i = 0; i < rows; i++) {
            if (limit > 0 && counter == limit) {
                break
            }
            row = document.createElement("div")
            row.className = ("d-flex justify-content-center")
            for (j = 0; j < cols; j++) {
                col = document.createElement("div")
                col.className = ("mx-2 my-2")
                col.style="width: 22vw; height: 22vW"
                a = document.createElement("a")
                image = imgArray.shift()
                if (image != undefined) {
                    a.href = image["fbImgLink"]
                    img = document.createElement("img")
                    img.src = image["src"]
                    img.setAttribute("loading", "lazy")
                    img.style = "object-fit: cover; width: 100%; height:100%"
                    a.appendChild(img)
                }
                col.appendChild(a)
                row.appendChild(col)
                counter++
            galleryContainer.appendChild(row)   
            }
        }
    }

    function loadImages(event) {

        // Load all remaining images from the imgArray of a particular album
        albumId = event.target.getAttribute("data-id")
        renderGallery(albumId, albumJSONDict[albumId]['imgArray'], 0)
        event.target.parentNode.removeChild(this)
    }


    // API Call to get a album and its images (for development usage only)
    // In production, we expect the apiCall to get the acutal JSON object containing multiple albums
    let apiCall =  "https://graph.facebook.com/v7.0/108341874213151?fields=photos{images,album,link},link&access_token=EAAVl5gvKOaQBADqtqIXx3cpw2ntGp43bmTPO7s7bib9GeuounqDL1Bqohuc92jSnMetIG85cWwIepx4Vdn2ZARgo9D411mfKBjYMEcEiFpWZAGQeiaBEwlHXLWz3Bt3HoSExHcfy7hwGreecSZCxgS1V7NDex9Fa0FzQktHjw4pZAHWRSH9mJ5LzgRW97vxVfZC6WycMziAZDZD"
    $.ajax({url: apiCall, success: function(response){

        // Construct a single album JSON object (for development usage only)
        function fbObjectParser(response) {
            let albumJSON = {"albumName": "", "imgArray": []}
            albumJSON["albumName"] = response["photos"]["data"][0]["album"]["name"]
            albumJSON["albumLink"] = response["fbAlbumLink"]
            response["photos"]["data"].map((each) => {
                let imgObject = {"src":"", "fbImgLink": ""}
                imgObject["src"] = each["images"][6]["source"]
                imgObject["fbImgLink"] = each["link"]
                albumJSON['imgArray'].push(imgObject)
            })
            return albumJSON
        }

        // Create a dictionary containing multiple albums (for development usage only)
        for (i = 0; i < 5; i++) {
            albumJSONDict[`album${i}`] = fbObjectParser(response)
        }

        // In production, we expect the response is a JSON object
        // containing multiple albums, so that we can store it in
        // albumJSONDict

        // albumJSONDict = response

        // Render albums
        for (let [key, value] of Object.entries(albumJSONDict)) {
            renderAlbum(key, albumJSONDict[key])
          }
    }});
})
