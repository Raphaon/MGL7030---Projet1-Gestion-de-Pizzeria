const ROUTES = [{
    pageId: "home",
    pageTitle: "Home",
    pageFile: "Home.html",
    pageUrl: "/"
},
{
        pageId: "orderDetail",
        pageUrl: "/orders/:id",
        pageFile: "OrderDetail.html",
        pageTitle: "Order Details"
    },
{
    pageId: "home",
    pageTitle: "Home",
    pageFile: "Home.html",
    pageUrl: "/home"
},

{
    pageId: "menu",
    pageTitle: "Menu",
    pageFile: "Menu.html",
    pageUrl: "/menu"
}, {
    pageId: "orders",
    pageTitle: "Orders",
    pageFile: "Orders.html",
    pageUrl: "/orders"
}, {
    pageId: "customers",
    pageTitle: "Customers",
    pageFile: "Customers.html",
    pageUrl: "/customers"
}, {
    pageId: "inventory",
    pageTitle: "Inventory",
    pageFile: "Inventory.html",
    pageUrl: "/inventory"
}, {
    pageId: "reports",
    pageTitle: "Reports",
    pageFile: "Reports.html",
    pageUrl: "/reports"

},
{
        pageId: "admin",
        pageUrl: "/admin",
        pageFile: "Admin.html",
        pageTitle: "Admin",
        protected: true
    }];
 export default ROUTES;


