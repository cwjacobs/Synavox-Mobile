// 10: {
//   "contact_id": 123,
//     "display_name": "Bear and Sally Galliers",
//       "email": [
//         {
//           "account_name": "cwjacobs@gmail.com",
//           "type": "home",
//           "address": "chanmota@hotmail.com"
//         }
//       ],
//         "phone": [
//           {
//             "account_name": "cwjacobs@gmail.com",
//             "type": "mobile",
//             "number": "(734) 417-4592"
//           }
//         ]
// }

export class Email {
  constructor(public account_name?: string, public type?: string, public address?: string) {
  };
}

export class Phone {
  constructor(public account_name?: string, public type?: string, public number?: string) {
  };
}

export class Organization {
  constructor(public account_name?: string, public company?: string) {
  };
}

export class Contact {
  constructor(public contact_id: number, public display_name?: string, public email?: Email[], public phone?: Phone[], public organization?: Organization[]) {
  };
}

