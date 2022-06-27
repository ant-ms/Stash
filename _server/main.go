package main

import (
	"bytes"
	"errors"
	"image"
	"io/ioutil"
	"log"
	"strconv"
	"strings"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	"github.com/gabriel-vasile/mimetype"
	"github.com/gin-gonic/gin"
)

type Cluster struct {
	Id   int    `json:"id" gorm:"primaryKey;"`
	Name string `json:"name"`
}

type Tag struct {
	Id      int    `json:"id" gorm:"primaryKey;"`
	Name    string `json:"name"`
	Cluster int
}

type Group struct {
	Id      int `gorm:"primaryKey;"`
	Cluster int
	Name    string
	Parent  int
}

type Media struct {
	Id      int    `json:"id" gorm:"primaryKey"`
	Type    string `json:"type"`
	Name    string `json:"name"`
	Date    int64  `gorm:"autoCreateTime"`
	Cluster int
	Group   int
}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST,HEAD,PATCH, OPTIONS, GET, PUT")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

func getCluster(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := strconv.Atoi(c.Param("cluster"))

	var count int64
	db.Model(&Cluster{}).Where(&Cluster{Id: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Cluster not found")
		return -1, errors.New("Cluster not found")
	}

	return clusterId, nil
}
func getGroup(c *gin.Context, db *gorm.DB) (int, error) {
	clusterId, _ := strconv.Atoi(c.Param("clusterId"))
	groupId, _ := strconv.Atoi(c.Param("group"))

	var count int64
	db.Model(&Group{}).Where(&Group{Id: groupId, Cluster: clusterId}).Count(&count)

	if count < 1 {
		c.String(404, "Group not Group")
		return -1, errors.New("Cluster not found")
	}

	return groupId, nil
}

func convertStringArrayToIntArray(input []string) []int {
	var output = []int{}

	for _, i := range input {
		if i != "" {

			j, err := strconv.Atoi(i)
			if err != nil {
				panic(err)
			}
			output = append(output, j)

		}
	}

	return output
}

func isInArray(query string, array []string) bool {
	var result bool = false
	for _, x := range array {
		if x == query {
			result = true
			break
		}
	}
	return result
}

func main() {
	r := gin.Default()
	r.Use(CORSMiddleware())

	db, err := gorm.Open(sqlite.Open("gorm.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&Cluster{})
	db.AutoMigrate(&Tag{})
	db.AutoMigrate(&Group{})
	db.AutoMigrate(&Media{})

	r.GET("/clusters", func(c *gin.Context) {

		var clusters []Cluster
		db.Find(&clusters)

		c.JSON(200, clusters)
	})

	r.GET("/:cluster/tags", func(c *gin.Context) {
		cluster, err := getCluster(c, db)
		if err != nil {
			return
		}

		// TODO: Re-add count
		type Tag_json struct {
			Id    int    `json:"id"`
			Name  string `json:"name"`
			Count int    `json:"count"`
		}

		var tags []Tag
		db.Model(&Tag{}).Where(&Tag{Cluster: cluster}).Scan(&tags)

		c.JSON(200, tags)
	})

	r.GET("/:cluster/groups", func(c *gin.Context) {

		type Group_json struct {
			Id       int          `json:"id"`
			Name     string       `json:"name"`
			Children []Group_json `json:"children"`
		}

		var newGroup func(Id int) Group_json
		newGroup = func(Id int) Group_json {
			group := Group_json{}
			group.Id = Id

			var result struct {
				Name     string
				Children string
			}
			db.Raw("SELECT Name, (select group_concat(id) FROM groups as g WHERE g.parent == groups.id) as Children FROM groups WHERE id = ?", Id).Scan(&result)

			group.Name = result.Name
			group.Children = []Group_json{}

			group.Children = []Group_json{}
			for _, i := range convertStringArrayToIntArray(strings.Split(result.Children, ",")) {
				group.Children = append(group.Children, newGroup(i))
			}

			return group
		}

		var primaryGroups []struct {
			Id   int    `json:"id"`
			Name string `json:"name"`
		}
		db.Raw("SELECT id, name FROM groups WHERE parent IS false AND cluster IS ?", c.Param("cluster")).Scan(&primaryGroups)

		var output = []Group_json{}

		output = append(output, Group_json{
			Id:       -1,
			Name:     "Unsorted",
			Children: []Group_json{},
		})
		output = append(output, Group_json{
			Id:       -2,
			Name:     "Trash",
			Children: []Group_json{},
		})

		for _, i := range primaryGroups {
			output = append(output, newGroup(i.Id))
		}

		c.JSON(200, output)
	})

	r.GET("/:cluster/:group/media", func(c *gin.Context) {
		group, err := getGroup(c, db)
		if err != nil {
			return
		}

		var media []Media
		db.Model(&Media{}).Where(&Media{Group: group}).Scan(&media)

		c.JSON(200, media)
	})

	r.POST("/:cluster/:group/media", func(c *gin.Context) {
		cluster, err := getCluster(c, db)
		if err != nil {
			return
		}
		// move into -1 instead of failing
		group, err := getGroup(c, db)
		if err != nil {
			return
		}

		file, err := c.FormFile("file")
		if err != nil {
			log.Fatal(err)
		}

		src, _ := file.Open()
		defer src.Close()

		var allowedTypes = []string{
			"image/png",
			"image/jpg",
		}
		media_type, _ := mimetype.DetectReader(src)
		log.Println(media_type.String())

		if !isInArray(media_type.String(), allowedTypes) {
			c.Status(422)
			return
		}

		media := &Media{Type: media_type.String(), Name: file.Filename, Cluster: cluster, Group: group}
		db.Create(&media)

		c.SaveUploadedFile(file, "media/"+strconv.Itoa(cluster)+"/"+strconv.Itoa(media.Id))

		c.Status(200)
	})

	r.GET("/:cluster/media/:id", func(c *gin.Context) {
		cluster := c.Param("cluster")
		id := c.Param("id")

		content, err := ioutil.ReadFile("media/" + cluster + "/" + id)
		if err != nil {
			log.Fatalf("failed to open image: %v", err)
		}

		c.Data(200, mimetype.Detect(content).String(), content)
	})

	r.GET("/:cluster/media/:id/thumbnail", func(c *gin.Context) {
		cluster := c.Param("cluster")
		id := c.Param("id")

		var thumbnailPath = "thumbnails/" + cluster + "/" + id + "." + ".webp"

		var original []byte
		var err error
		original, err = ioutil.ReadFile(thumbnailPath)
		if err != nil {

			log.Printf("Thumbnail not found, creating new one: %v", err)

			media, err := imaging.Open("media/" + cluster + "/" + id)
			if err != nil {
				log.Printf("failed to open image: %v", err)
			}

			// the smallest side is always 1000 pixels
			var dstImage *image.NRGBA
			if media.Bounds().Dx() > media.Bounds().Dy() {
				// if the image is wider than tall
				dstImage = imaging.Resize(media, 0, 650, imaging.Lanczos)
			} else {
				// if the image is taller than wide
				dstImage = imaging.Resize(media, 650, 0, imaging.Lanczos)
			}

			var buf bytes.Buffer
			if err = webp.Encode(&buf, dstImage, &webp.Options{Quality: 20}); err != nil {
				log.Printf("failed to encode image: %v", err)
			}

			original = buf.Bytes()

			ioutil.WriteFile(thumbnailPath, original, 0740)

		}

		c.Data(200, "images/webp", original)
	})

	r.Run() // listen and serve on 0.0.0.0:8080
}
