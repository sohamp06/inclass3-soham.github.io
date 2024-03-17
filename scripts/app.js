"use strict";
(function () {
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function AddLinkEvents(link) {
        let linkQuery = $(`a.nav-link[data=${link}]`);
        linkQuery.off("click");
        linkQuery.off("mouseover");
        linkQuery.off("mouseout");
        linkQuery.css("text-decoration", "underline");
        linkQuery.css("color", "blue");
        linkQuery.on("click", function () {
            LoadLink(`${link}`);
        });
        linkQuery.on("mouseover", function () {
            $(this).css("cursor", "pointer");
            $(this).css("font=weight", "bold");
        });
        linkQuery.on("mouseout", function () {
            $(this).css("font=weight", "normal");
        });
    }
    function AddNavigationEvents() {
        let navLinks = $("ul>li>a");
        navLinks.off("click");
        navLinks.off("mouseover");
        navLinks.on("click", function () {
            LoadLink($(this).attr("data"));
        });
        navLinks.on("mouseover", function () {
            $(this).css("cursor", "pointer");
        });
    }
    function LoadLink(link, data = "") {
        router.ActiveLink = link;
        AuthGuard();
        router.linkData = data;
        history.pushState({}, "", router.ActiveLink);
        document.title = capitalizeFirstLetter(router.ActiveLink);
        $("ul>li>a").each(function () {
            $(this).removeClass("active");
        });
        $(`li>a:contains(${document.title})`).addClass("active");
        LoadContent();
    }
    function AuthGuard() {
        let protected_routes = ["contactList"];
        if (protected_routes.indexOf(router.ActiveLink) > -1) {
            if (!sessionStorage.getItem("user")) {
                LoadLink("login");
            }
        }
    }
    function CheckLogin() {
        console.log("login checked");
        if (sessionStorage.getItem("user")) {
            $("#login").html(`<a id="logout" class="nav-link" data="#"><i class="fa fa-sign-out-alt"></i>Logout</a>`);
            $("#logout").on("click", function () {
                sessionStorage.clear();
                $("#logout").html(`<a class="nav-link" data="login" id="login"><i class="fa fa-sign-in-alt"></i> Login</a>`);
                LoadLink("login");
                AddNavigationEvents();
            });
        }
    }
    function DisplayLoginPage() {
        console.log("Called DisplayLoginPage()");
        let messageArea = $("#messageArea");
        messageArea.hide();
        $("#loginButton_1").on("click", (event) => {
            event.preventDefault();
            let success = false;
            let newUser;
            newUser = new core.User();
            $.get("./data/user.json", function (data) {
                for (const user of data.users) {
                    let username = document.forms[0].username.value;
                    let password = document.forms[0].password.value;
                    if (username === user.UserName && password === user.Password) {
                        newUser.fromJSON(user);
                        success = true;
                        break;
                    }
                }
                if (success) {
                    sessionStorage.setItem("user", newUser.serialize());
                    messageArea.removeAttr("class").hide();
                    LoadLink("contactList");
                }
                else {
                    $("#user").trigger("focus").trigger("select");
                    messageArea.addClass("alert alert-danger");
                    messageArea.text("Please Enter Valid Credentials");
                    messageArea.show();
                }
            });
        });
        $("#cancelButton").on("click", function () {
            document.forms[0].reset();
            LoadLink("home");
        });
    }
    function ContactFormValidation() {
        ValidateField("#fullName", /^([A-Z][a-z]{1,3}\.?\s)?([A-Z][a-z]+)+([\s,-]([A-z][a-z]+))*$/, "Please Enter a Valid Full Name");
        ValidateField("#contactNumber", /^(\+\d{1,3}[\s-.])?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]\d{4}$/, "Enter a valid Contact Number");
        ValidateField("#email", /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,10}$/, "Please enter a valid email address");
    }
    function ValidateField(input_field_id, regular_expression, error_message) {
        let messageArea = $("#messageArea").hide();
        $(input_field_id).on("blur", function () {
            let inputFieldText = $(this).val();
            if (!regular_expression.test(inputFieldText)) {
                $(this).trigger("focus").trigger("select");
                messageArea.addClass("alert alert-danger").text(error_message);
                messageArea.show();
            }
            else {
                messageArea.removeAttr("class").hide();
            }
        });
    }
    function InsertNewRecord(fullName, contactNumber, emailAddress) {
        let contact = new core.Contact(fullName, contactNumber, emailAddress);
        if (contact.serialize()) {
            let key = contact.fullName.substring(0, 1) + Date.now();
            localStorage.setItem(key, contact.serialize());
        }
    }
    function DisplayHomePage() {
        console.log("Called DisplayHomePage()");
        $("#AboutUsBtn").on("click", () => {
            LoadLink("about");
        });
        $("main").append(`<p id = "MainParagraph" class="mt-3">This is my First Paragraph</p>
                                <article class="container">
                                    <p id="ArticleParagraph" class="mt-3">This is my article paragraph</p>
                                </article>`);
    }
    function DisplayProductsPage() {
        console.log("Called DisplayProductsPage()");
    }
    function DisplayAboutPage() {
        console.log("Called DisplayAboutPage()");
    }
    function DisplayServicesPage() {
        console.log("Called DisplayServicesPage()");
    }
    function DisplayContactPage() {
        console.log("Called DisplayContactPage()");
        ContactFormValidation();
        let sendButton = document.getElementById("sendButton");
        let subscribeButton = document.getElementById("subscribe");
        $("#sendButton").on("click", function (event) {
            event.preventDefault();
            let fullName = document.forms[0].fullName.value;
            let contactNumber = document.forms[0].contactNumber.value;
            let emailAddress = document.forms[0].email.value;
            InsertNewRecord(fullName, contactNumber, emailAddress);
            document.forms[0].reset();
            LoadLink("contactList");
        });
        $("#list").on("click", function () {
            LoadLink("contactList");
        });
    }
    function DisplayContactListPage() {
        console.log("ContactListPage() Executed");
        if (localStorage.length > 0) {
            let contactList = document.getElementById("contactList");
            let data = "";
            let keys = Object.keys(localStorage);
            let index = 1;
            for (const key of keys) {
                let contact = new core.Contact();
                let contactData = localStorage.getItem(key);
                contact.deserialize(contactData);
                data += `<tr>
                            <th scope="row" class="text-center">${index}</th>
                            <td>${contact.fullName}</td>
                            <td>${contact.contactNumber}</td>
                            <td>${contact.emailAddress}</td>
                            <td class = "text-center">
                                <button value="${key}" class="btn btn-primary btn-sm edit"><i class="fas fa-dit fa-sm"></i>
                                Edit</button>
                                <button  value="${key}" class="btn btn-danger btn-sm delete"><i class="fas fa-trash-alt fa-sm"></i>Delete</button>
                            </td>
                            <td></td>
                        </tr>`;
                index++;
            }
            contactList.innerHTML = data;
        }
        $("#addButton").on("click", () => {
            LoadLink("edit", "add");
        });
        $("button.delete").on("click", function () {
            if (confirm("Please Confirm contact Deletion ?")) {
                localStorage.removeItem($(this).val());
            }
            LoadLink("contactList");
        });
        $("button.edit").on("click", function () {
            LoadLink(`edit`, `${$(this).val()}`);
        });
    }
    function DisplayEditPage() {
        console.log("EditPagePage() function invoked !");
        ContactFormValidation();
        let page = router.linkData;
        let button = $("#editButton");
        switch (page) {
            case "add":
                $("#editHeading").text("Add Contact");
                button.html(`<i class="fas fa-plug-circle fa-sm"></i>Add`);
                button.on("click", function (event) {
                    event.preventDefault();
                    let fullName = document.forms[0].fullName.value;
                    let contactNumber = document.forms[0].contactNumber.value;
                    let emailAddress = document.forms[0].email.value;
                    InsertNewRecord(fullName, contactNumber, emailAddress);
                    LoadLink("contactList");
                });
                break;
            default:
                let contact = new core.Contact();
                contact.deserialize(localStorage.getItem(page));
                $("#fullName").val(contact.fullName);
                $("#contactNumber").val(contact.contactNumber);
                $("#email").val(contact.emailAddress);
                button.on("click", function (event) {
                    event.preventDefault();
                    contact.fullName = $("#fullName").val();
                    contact.contactNumber = $("#contactNumber").val();
                    contact.emailAddress = $("#email").val();
                    localStorage.setItem(page, contact.serialize());
                    LoadLink("contactList");
                });
                $("#cancelButton").on("click", function () {
                    LoadLink("contactList");
                });
                break;
        }
    }
    function DisplayRegisterPage() {
        console.log("Called DisplayRegisterPage");
        AddLinkEvents("login");
    }
    function Display404Page() {
        console.log("Called Display404Page");
    }
    function ActiveLinkCallBack() {
        switch (router.ActiveLink) {
            case "about": return DisplayAboutPage;
            case "contact": return DisplayContactPage;
            case "contactList": return DisplayContactListPage;
            case "home": return DisplayHomePage;
            case "edit": return DisplayEditPage;
            case "service": return DisplayServicesPage;
            case "register": return DisplayRegisterPage;
            case "login": return DisplayLoginPage;
            case "product": return DisplayProductsPage;
            case "404": return Display404Page;
            default:
                console.error("ERROR: callback does not exist" + router.ActiveLink);
                return new Function();
        }
    }
    function CapitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    function loadHeader() {
        $.get("./views/components/header.html", function (html_data) {
            $("header").append(html_data);
            document.title = CapitalizeFirstLetter(router.ActiveLink);
            $(`li>a:contains(${document.title})`).addClass("active").attr("aria-current", "page");
            AddNavigationEvents();
            CheckLogin();
        });
    }
    function LoadContent() {
        let page_name = router.ActiveLink;
        let callback = ActiveLinkCallBack();
        $.get(`./views/content/${page_name}.html`, function (html_data) {
            $("main").html(html_data);
            CheckLogin();
            callback();
        });
    }
    function LoadFooter() {
        $.get("./views/components/footer.html", function (html_data) {
            $("footer").html(html_data);
        });
    }
    function Start() {
        console.log("App Started");
        loadHeader();
        LoadLink("home");
        LoadFooter();
    }
    window.addEventListener("load", Start);
}());
