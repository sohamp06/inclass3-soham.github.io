
namespace core
{

        export class User {


            private _displayName: string;
            private _emailAddress: string;
            private  _username: string;
            private  _password : string;


            constructor(displayName = "", emailAddress = "", username = "", password = "") {

                this._displayName = displayName;
                this._emailAddress = emailAddress;
                this._username = username;
                this._password = password;
            }


            public  get displayName(): string
            {
                return this._displayName;
            }

            public set displayName(value:string) {
                this._displayName = value;
            }

            public get emailAddress(): string
            {
                return this._emailAddress;
            }

            public  set emailAddress(value: string)
            {
                this._emailAddress = value;
            }

            public  get username(): string
            {
                return this._username;
            }

            public set username(value: string)
            {
                this._username = value;
            }


            toString():string
            {
                return `Display Name: ${this._displayName} \n Email Address: ${this._emailAddress} \n 
                Username: ${this.username}`;
            }

            toJSON(): {DisplayName:string, EmailAddress: string, Username:string, Password:string} {
                return {
                    DisplayName: this._displayName,
                    EmailAddress: this._emailAddress,
                    Username: this._username,
                    Password: this._password
                };
            }


            fromJSON(data: {DisplayName:string, EmailAddress: string, Username:string, Password:string}) {
                this._displayName = data.DisplayName;
                this._emailAddress = data.EmailAddress;
                this._username = data.Username;
                this._password = data.Password;
            }



            serialize():string | null {

                if (this._displayName !== "" && this._emailAddress !== ""
                    && this._username !== "") {

                    return `${this._displayName}, ${this._emailAddress},${this.username}`;
                }
                console.error("Failed to Serialize: Attributes are missing");
                return null;
            }


            deserialize(data:string)
            {


                let propertyArray = data.split(",");
               this._displayName = propertyArray[0];
                this._emailAddress = propertyArray[1];
                this._emailAddress = propertyArray[2];
            }
        }
}
