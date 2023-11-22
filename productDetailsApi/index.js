const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'productDetails.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

// api to get product details based on filters

app.get('/products/', async (request, response) => {
  const {
    page = 0,
    pageSize = 100,
    productName = '',
    category = '',
  } = request.query
  const getProductsQuery = `
    SELECT
      *
    FROM
      product
    WHERE 
    product_name LIKE '%${productName}%' AND 
    product_category LIKE '%${category}%'
    LIMIT ${pageSize};`
  const productArray = await db.all(getProductsQuery)
  response.send(productArray)
})

// api to get single product Details

app.get('/products/:productId/', async (request, response) => {
  const {productId} = request.params
  const getProductQuery = `
    SELECT
      *
    FROM
      product
    WHERE
      product_id = ${productId};`
  const product = await db.get(getProductQuery)
  response.send(product)
})

// api to delete product from table

app.delete('/products/:productId/', async (request, response) => {
  const {productId} = request.params
  const deleteProductQuery = `
    DELETE FROM
      product
    WHERE
      product_id = ${productId};`
  await db.run(deleteProductQuery)
  response.send('Product Deleted Successfully')
})

// api to create new product details

app.post('/products/', async (request, response) => {
  const productDetails = request.body

  const {productName, productCategory, imgUrl, productDescription} =
    productDetails

  const getProductQuery = `
    SELECT
      *
    FROM
      product
    WHERE
      product_name = '${productName}';`
  const product = await db.get(getProductQuery)

  if (product === undefined) {
    const addProductQuery = `
    INSERT INTO
      product (  product_name, product_category, imgUrl, product_description)
    VALUES
      (
        '${productName}',
        '${productCategory}',
        '${imgUrl}',
        '${productDescription}'

      );`

    const dbResponse = await db.run(addProductQuery)
    const productID = dbResponse.lastID
    response.send({productId: productID})
  } else {
    response.send('User Already Exist')
  }
})

// api to update product details

app.put('/products/:productID/', async (request, response) => {
  const {productID} = request.params
  const productDetails = request.body
  const {productName, productCategory, imgUrl, productDescription} =
    productDetails
  console.log(productDetails)

  const updateProductQuery = `
    UPDATE
      product
    SET
      product_name = '${productName}',
      product_category = '${productCategory}',
      imgUrl = '${imgUrl}',
      product_description = '${productDescription}'
     WHERE
      product_id = ${productID};`
  await db.run(updateProductQuery)
  response.send('Book Updated Successfully')
})