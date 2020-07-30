const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { addReview } = require('./db');
const path = require('path');

const neode = require('neode')
  .fromEnv()
  .withDirectory(path.join(__dirname, 'models'));

const app = express();
app.use(cors());
const PORT = 3005;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function getReview(productID, page, count, sort) {
  const params = { productID: productID };

  const cypher = `
    MATCH (r:Review)
    WHERE r.product_id = $productID
    MATCH (n:Review) - [:hasPhoto] -> (p:Photos)
    WHERE n.product_id = $productID
    RETURN r,p`;

  return neode.cypher(cypher, params).then((res) => {
    const reviewApiData = {
      product: productID,
      page: page || 0,
      count: count || 5,
      results: [],
    };
    const data = {};
    res.records.map((record) => {
      const reviewId = record._fields[0].properties.id;
      const review = record._fields[0].properties;
      reviewId in data ? '' : (data[reviewId] = review);
      const allPhotoData = record._fields[1].properties;
      const photo = {
        id: allPhotoData.id,
        url: allPhotoData.url,
      };
      'photos' in data[reviewId]
        ? data[reviewId].photos.push(photo)
        : (data[reviewId].photos = [photo]);
    });
    for (var k in data) {
      reviewApiData.results.push(data[k]);
    }
    return reviewApiData;
  });
}

app.get('/reviews/:product_id/list', (req, res) => {
  getReview(req.params.product_id).then((data) => {
    res.status(200).send(data);
  });
});
app.get('/reviews/:product_id/meta', (req, res) => {});
app.post('/reviews/:product_id', (req, res) => {
  console.log(req.params.product_id);
  console.log(req.body);
  addReview(req.body, req.params.product_id);
  res.sendStatus(201);
});
app.put('/reviews/helpful/:review_id', (req, res) => {});
app.put('/reviews/report/:review_id', (req, res) => {});

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
