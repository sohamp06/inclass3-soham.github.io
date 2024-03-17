"use strict";

(function(){

    function capitalizeFirstLetter(str:string){
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function AddLinkEvents(link:string):void {
        let linkQuery = $( `a.nav-link[data=${link}]`);
        linkQuery.off("click");
        linkQuery.off("mouseover");
        linkQuery.off("mouseout");
        linkQuery.css("text-decoration", "underline")
        linkQuery.css("color", "blue");
        linkQuery.on("click", function ()
        {
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

    function AddNavigationEvents():void
    {
        let navLinks: JQuery<HTMLElement> = $("ul>li>a");
        navLinks.off("click");
        navLinks.off("mouseover");
        navLinks.on("click", function()
        {
            LoadLink($(this).attr("data") as string)
        });
        navLinks.on("mouseover", function(){
            $(this).css("cursor", "pointer");
        });
    }

    function LoadLink(link:string, data:string = ""):void
    {
        router.ActiveLink = link;
        AuthGuard();
        router.linkData = data;
        history.pushState({}, "", router.ActiveLink);
        document.title = capitalizeFirstLetter(router.ActiveLink);
        $("ul>li>a").each(function()
        {
            $(this).removeClass("active");
        });
        $(`li>a:contains(${document.title})`).addClass("active");
        LoadContent();
    }

    function AuthGuard()
    {
        let protected_routes = ["contactList"];
        if (protected_routes.indexOf(router.ActiveLink) > -1) {
            if (!sessionStorage.getItem("user")) {
                LoadLink("login");
            }
        }
    }

    function CheckLogin()
    {
        console.log("login checked")
        if(sessionStorage.getItem("user"))
        {
            $("#login").html(`<a id="logout" class="nav-link" data="#"><i class="fa fa-sign-out-alt"></i>Logout</a>`)
            $("#logout").on("click", function ()
            {
                sessionStorage.clear();
                $("#logout").html(`<a class="nav-link" data="login" id="login"><i class="fa fa-sign-in-alt"></i> Login</a>`)
                LoadLink("login");
                AddNavigationEvents();
            });
        }
    }

    function DisplayLoginPage()
    {
        console.log("Called DisplayLoginPage()");
        let messageArea: any | HTMLElement  = $("#messageArea");
        messageArea.hide();
        $("#loginButton_1").on("click",
            (event) =>
            {
                event.preventDefault()
                let success: boolean = false;
                let newUser: core.User;
                newUser = new core.User();
                $.get("./data/user.json", function(data):void
                {
                    for (const user of data.users)
                    {
                        let username:string = document.forms[0].username.value;
                        let password:string = document.forms[0].password.value;
                        if ( username === user.UserName &&  password === user.Password)
                        {
                            newUser.fromJSON(user);
                            success = true;
                            break;
                        }
                    }
                    if(success)
                    {
                        sessionStorage.setItem("user",<string> newUser.serialize());
                        messageArea.removeAttr("class").hide();
                        LoadLink("contactList")
                    }
                    else
                    {
                        $("#user").trigger("focus").trigger("select");
                        messageArea.addClass("alert alert-danger");
                        messageArea.text("Please Enter Valid Credentials");
                        messageArea.show();
                    }
                });
            }
        )
        $("#cancelButton").on("click",
            function()
            {
                document.forms[0].reset();
                LoadLink("home");
            }
        );
    }

    function ContactFormValidation():void
    {
        ValidateField("#fullName",
            /^([A-Z][a-z]{1,3}\.?\s)?([A-Z][a-z]+)+([\s,-]([A-z][a-z]+))*$/,
            "Please Enter a Valid Full Name");
        ValidateField("#contactNumber", /^(\+\d{1,3}[\s-.])?\(?\d{3}\)?[\s-.]?\d{3}[\s-.]\d{4}$/, "Enter a valid Contact Number")
        ValidateField("#email", /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]{2,10}$/, "Please enter a valid email address");
    }

    function ValidateField(input_field_id: string, regular_expression: RegExp, error_message: String): void
    {
        let messageArea :JQuery<HTMLElement> = $("#messageArea").hide();
        $(input_field_id).on("blur",function ()
        {
            let inputFieldText:string | number | string[] | undefined = $(this).val();
            if(!regular_expression.test(<string> inputFieldText))
            {
                $(this).trigger("focus").trigger("select");
                messageArea.addClass("alert alert-danger").text(<string>error_message);
                messageArea.show();
            }
            else
            {
                messageArea.removeAttr("class").hide();
            }
        });
    }

    function InsertNewRecord(fullName:string, contactNumber:string, emailAddress:string)
    {
        let contact = new core.Contact(fullName,contactNumber,emailAddress);
        if(contact.serialize())
        {
            let key: string = contact.fullName.substring(0,1) + Date.now();
            localStorage.setItem(key,contact.serialize() as  string);
        }
    }

    function DisplayHomePage()
    {
        console.log("Called DisplayHomePage()");
        $("#AboutUsBtn").on("click",
            ()=>
            {
                LoadLink("about");
            })
        $("main").append(`<p id = "MainParagraph" class="mt-3">This is my First Paragraph</p>
                                <article class="container">
                                    <p id="ArticleParagraph" class="mt-3">This is my article paragraph</p>
                                </article>`);
    }

    function DisplayProductsPage()
    {
        console.log("Called DisplayProductsPage()");
    }

    function DisplayAboutPage(){
        console.log("Called DisplayAboutPage()");
    }

    function DisplayServicesPage(){
        console.log("Called DisplayServicesPage()");
    }

    function DisplayContactPage()
    {
        console.log("Called DisplayContactPage()");
        ContactFormValidation();
        let sendButton: HTMLElement = document.getElementById("sendButton") as HTMLElement;
        let subscribeButton: HTMLElement = document.getElementById("subscribe")  as HTMLElement;
        $("#sendButton").on("click",function (event)
        {
            event.preventDefault();
            let fullName:string = document.forms[0].fullName.value;
            let contactNumber:string = document.forms[0].contactNumber.value;
            let emailAddress:string = document.forms[0].email.value;
            InsertNewRecord(fullName, contactNumber, emailAddress);
            document.forms[0].reset();
            LoadLink("contactList");
        })
        $("#list").on("click", function()
        {
            LoadLink("contactList");
        })
    }

    function DisplayContactListPage():void
    {
        console.log("ContactListPage() Executed");
        if (localStorage.length > 0)
        {
            let contactList : HTMLElement = document.getElementById("contactList") as HTMLElement;
            let data = "";
            let keys = Object.keys(localStorage);
            let index : number = 1;
            for (const key of keys)
            {
                let contact: core.Contact = new core.Contact();
                let contactData: string= localStorage.getItem(key) as string;
                contact.deserialize(contactData as string);
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
        $("#addButton").on("click",
            () =>
            {
                LoadLink("edit","add");
            }
        )
        $("button.delete").on("click", function()
        {
            if(confirm("Please Confirm contact Deletion ?"))
            {
                localStorage.removeItem($(this).val() as string)
            }
            LoadLink("contactList");
        })
        $("button.edit").on("click", function()
        {
            LoadLink(`edit`, `${$(this).val()}`);
        })
    }

    function DisplayEditPage()
    {
        console.log("EditPagePage() function invoked !");
        ContactFormValidation();
        let page : string = router.linkData;
        let button: JQuery<HTMLElement>  = $("#editButton");
        switch (page)
        {
            case "add":
                $("#editHeading").text("Add Contact");
                button.html(`<i class="fas fa-plug-circle fa-sm"></i>Add`);
                button.on("click", function (event)
                {
                    event.preventDefault();
                    let fullName:string = document.forms[0].fullName.value;
                    let contactNumber:string = document.forms[0].contactNumber.value;
                    let emailAddress:string = document.forms[0].email.value;
                    InsertNewRecord(fullName , contactNumber, emailAddress);
                    LoadLink("contactList");
                });
                break;
            default:
                let contact = new core.Contact();
                contact.deserialize(localStorage.getItem(page) as  string);
                $("#fullName").val(contact.fullName);
                $("#contactNumber").val(contact.contactNumber);
                $("#email").val(contact.emailAddress);
                button.on("click", function (event)
                {
                    event.preventDefault();
                    contact.fullName = <string> $("#fullName").val();
                    contact.contactNumber = <string> $("#contactNumber").val();
                    contact.emailAddress = <string> $("#email").val();
                    localStorage.setItem(page, <string> contact.serialize());
                    LoadLink("contactList");
                });
                $("#cancelButton").on("click", function () {
                    LoadLink("contactList");
                });
                break;
        }
    }

    function DisplayRegisterPage(){
        console.log("Called DisplayRegisterPage");
        AddLinkEvents("login");
    }

    function Display404Page(){
        console.log("Called Display404Page");
    }

    function ActiveLinkCallBack(): Function
    {
        switch (router.ActiveLink)
        {
            case "about": return DisplayAboutPage;
            case "contact" : return  DisplayContactPage;
            case "contactList" : return DisplayContactListPage;
            case "home": return DisplayHomePage;
            case "edit" : return DisplayEditPage;
            case "service" : return DisplayServicesPage;
            case "register" : return DisplayRegisterPage;
            case "login" : return  DisplayLoginPage;
            case "product" : return DisplayProductsPage;
            case "404" : return Display404Page;
            default:
                console.error("ERROR: callback does not exist" + router.ActiveLink);
                return new Function();
        }
    }

    function CapitalizeFirstLetter(str: string)
    {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function loadHeader()
    {
        $.get("./views/components/header.html", function (html_data)
        {
            $("header").append(html_data);
            document.title = CapitalizeFirstLetter(router.ActiveLink);
            $(`li>a:contains(${document.title})`).addClass("active").attr("aria-current","page");
            AddNavigationEvents();
            CheckLogin();
        });
    }

    function LoadContent():void
    {
        let page_name: string = router.ActiveLink;
        let callback = ActiveLinkCallBack();
        $.get(`./views/content/${page_name}.html`, function (html_data)
        {
            $("main").html(html_data);
            CheckLogin();
            callback();
        });
    }

    function  LoadFooter()
    {
        $.get("./views/components/footer.html", function (html_data)
        {
            $("footer").html(html_data);
        })
    }

    function Start()
    {
        console.log("App Started");
        loadHeader();
        LoadLink("home");
        LoadFooter();
    }

    window.addEventListener("load", Start);
}())
