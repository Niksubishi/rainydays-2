import { API_PRODUCTS_URL } from "./constants.mjs";

document.addEventListener("DOMContentLoaded", async function () {
  function updateBasketView() {
    const basketItemsContainer = document.getElementById("basket-items");
    let basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

    basketItemsContainer.innerHTML = "";

    basketItems.forEach((item) => {
      const basketItem = document.createElement("div");
      basketItem.classList.add("jacketbox2");

      basketItem.innerHTML = `
          <div class="jacketpicbox2">
            <a href="product-details.html?id=${item.id}"><img src="${
        item.image
      }" alt="${item.name}"></a>
          </div>
          <div class="jackettextbox2">
            <h4>${item.name}</h4>
            <p>${item.description || "Description not available"}</p>
            <p>$${item.price}</p>
            <button class="remove-from-basket" data-id="${
              item.id
            }">Remove</button>
          </div>
        `;
      basketItemsContainer.appendChild(basketItem);
    });
  }

  document.addEventListener("click", async function (event) {
    if (event.target.classList.contains("add-to-basket")) {
      const productId = event.target.getAttribute("data-id");
      const productName = event.target.getAttribute("data-name");
      const productPrice = event.target.getAttribute("data-price");
      const productImage = event.target.getAttribute("data-image");
      const productDescription = event.target.getAttribute("data-description");

      let basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

      basketItems.push({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
        description: productDescription,
      });

      localStorage.setItem("basketItems", JSON.stringify(basketItems));
    } else if (event.target.classList.contains("remove-from-basket")) {
      const productId = event.target.getAttribute("data-id");

      let basketItems = JSON.parse(localStorage.getItem("basketItems")) || [];

      const indexToRemove = basketItems.findIndex(
        (item) => item.id === productId
      );

      if (indexToRemove !== -1) {
        basketItems.splice(indexToRemove, 1);
        localStorage.setItem("basketItems", JSON.stringify(basketItems));
      }

      updateBasketView();
    }
  });

  try {
    const response = await fetch(API_PRODUCTS_URL);
    const data = await response.json();
    const productList = document.getElementById("product-listing");

    const filterProductsByGender = (products, gender) => {
      if (gender === "all") {
        return products;
      } else {
        return products.filter((product) => product.gender === gender);
      }
    };

    const renderProducts = (products) => {
      productList.innerHTML = "";
      products.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.classList.add("jacketbox2");
        productElement.innerHTML = `
            <div class="jacketpicbox2">
              <a href="jacket1.html"><img src="${product.image?.url}" alt="${
          product.name
        }"></a>
            </div>
            <div class="jackettextbox2">
              <h4>${product.title}</h4>
              <p>${product.description || "Description not available"}</p>
              <p>$${product.price}</p>
            </div>
            <div class="button-container">
              <button class="add-to-basket" data-id="${
                product.id
              }" data-name="${product.title}" data-price="${
          product.price
        }" data-image="${product.image?.url}" data-description="${
          product.description
        }">Add to Cart</button>
            </div>
          `;
        productList.appendChild(productElement);
      });
    };

    renderProducts(data.data);

    const genderFilter = document.getElementById("gender-filter");
    genderFilter.addEventListener("change", (event) => {
      const selectedGender = event.target.value;
      const filteredProducts = filterProductsByGender(
        data.data,
        selectedGender
      );
      renderProducts(filteredProducts);
    });
  } catch (error) {
    console.error("Error fetching product data:", error);
  }

  updateBasketView();
});
