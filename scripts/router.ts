"use strict";

namespace  core
{
    export  class Router
    {


        private _activeLink:string;

        private _routingTable:string[];

        private _linkData:string


        constructor()
        {
            this._activeLink = "";
            this._routingTable = [];
            this._linkData = "";
        }


        public get ActiveLink():string {
            return this._activeLink;
        }

        public set ActiveLink(link:string){
            this._activeLink = link;
        }

        public get linkData():string {
            return this._linkData;
        }

        public set linkData(link:string){
            this._linkData = link;
        }


        public Add(route:string):void
        {

            this._routingTable.push(route);
        }


        public AddTable(routingTable:string[]){
            this._routingTable = routingTable;
        }


        public Find(route:string):number{
            return this._routingTable.indexOf(route);
        }


        public Remove(route:string){
            if(this.Find(route) > -1){
                this._routingTable.splice(this.Find(route), 1)
                return true;
            }
            return false;
        }


        public toString():string {
            return this._routingTable.toString();
        }


    }

}

let router:core.Router = new core.Router();

router.AddTable( [
    "/",
    "/home",
    "/about",
    "/services",
    "/contact",
    "/contactList",
    "/product",
    "/register",
    "/login",
    "/edit"
]);

let route = location.pathname;


router.ActiveLink = (router.Find(route) > -1) ? ((route === "/") ? "home" : route.substring(1)) : ("404");
