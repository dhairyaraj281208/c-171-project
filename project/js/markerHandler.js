var tableNumber = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {


    if (tableNumber === null) {
      this.askTableNumber();
    }

    var toys = await this.gettoys();
    console.log(toys)

    this.el.addEventListener("markerFound", () => {
      console.log("marker found")
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askTableNumber: function () {
    var iconUrl = "https:raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "Welcome to Hunger!!",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeholder: "Type your table number",
          type: "number",
          min: 1
        }
      },
      closeOnClickOutside: false,
    }).then(inputValue => {
      tableNumber = inputValue;
    });
  },

  handleMarkerFound: function (toys, markerId) {

    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();

    //  sunday - saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    var toy = toys.filter(toy => toy.id === markerId)
    if (toy.is_out_of_stock === true) {
      swal({
        icon: "warning",
        title: toy.toy_name.toUpperCase(),
        text: "Sorry this toy is not in stock",
        timer: 2500,
        buttons: false
      });
    } else {

      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.rotation);
      model.setAttribute("scale", toy.model_geometry.scale);

      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${toy.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${toy.id}`);
      priceplane.setAttribute("visible", true)

      var buttonDiv = document.getElementById("button-div");
      buttonDiv.style.display = "flex";

      var ratingButton = document.getElementById("rating-button");
      var orderButtton = document.getElementById("order-button");

      if (tableNumber != null) {
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Rate toy",
            text: "Work In Progress"
          });
        });

        orderButtton.addEventListener("click", () => {
          var uNumber;
          tableNumber <= 9 ? (uNumber = `U0${tableNumber}`) : `U${tableNumber}`;
          this.handleOrder(uNumber, toy);

          swal({
            icon: "https://i.imgur.com/4NZ6uLY.jpg",
            title: "Thanks For Order !",
            text: "Your order will be dilevered to your house",
            timer: 2000,
            buttons: false
          });
        });
      }
    }
  },
  handleOrder: function (uNumber, toy) {
    firebase
      .firestore()
      .collection("users")
      .doc(uNumber)
      .get()
      .then(doc => {
        var details = doc.data();

        if (details["current_orders"][toy.id]) {
          details["current_orders"][toy.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][toy.id]["quantity"];

          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price;
        } else {
          details["current_orders"][toy.id] = {
            item: toy.toy_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }

        details.total_bill += toy.price;

        firebase
          .firestore()
          .collection("users")
          .doc(doc.id)
          .update(details);
      });
  },
  gettoys: async function () {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function () {
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  }
});