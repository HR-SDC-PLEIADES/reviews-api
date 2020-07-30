const Neode = require('neode');

const instance = new Neode('bolt://localhost:7687', 'neo4j', 'test');

const getReview = (productID, page, count, sort) => {
  instance
    .cypher(
      `MATCH (r:Review {product_id: '${productID}'}) - [:hasPhoto] -> (p:Photos)
      RETURN r,p`
    )
    .then((res) => {
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
      console.log(reviewApiData.results[0].photos);
    })
    .catch((err) => console.log(err));
};

// const addReview = (body, product_id) => {
//   console.log('adding review');
//   // create review node
//   // const review = {
//   //   body: body.body,
//   //   date: 'have to put a date here',
//   //   helpfullness: 0,
//   //   product_id: product_id,
//   //   recommend: body.recommend ? 1 : 0,
//   //   response: null,
//   //   reviewer_email: body.email,
//   //   reviewer_name: body.name,
//   //   summary: body.summary,
//   //   reported: 0,
//   //   rating: body.rating,
//   // };
//   // let reviewJSON = JSON.stringify(review);
//   instance
//     .create('Person', {
//       name: 'Adam',
//     })
//     .then((adam) => {
//       console.log(adam.get('name')); // 'Adam'
//     });

//   // create characteristic node have to make each characteristic a seperate obj, then add each of those in the query
//   // const charArr = [];
//   // for (var k in body.characteristics) {
//   //   let obj = {};
//   //   obj[k] = characteristics[k];
//   //   charArr.push(obj);
//   // }
//   // charArr.forEach((char) => {
//   //   instance
//   //     .cypher(`CREATE (c:Characteristics${char})`)
//   //     .then((res) => {
//   //       console.log('Characteristic node created');
//   //     })
//   //     .catch((err) => console.log(err));
//   // });

//   // for each photo link create a new node
//   // if (body.photos) {
//   //   if (Array.isArray(body.photos)) {
//   //   }
//   // }
// };

// module.exports = { addReview };

// addReview();
