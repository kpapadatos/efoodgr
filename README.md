## efoodgr
An unofficial CLI tool to manage your efood.gr account and place orders.

#### Installation
`npm i -g efoodgr`

#### Usage
  `efood <command> [options]`

  Get help for each command with
  `efood <command> --help`

  Commands:

    login|l [options]              Log in with your efood.gr account.
    menu                           Gets the menu of the selected store.
    dropaddr [addressId]           Removes address from your account.
    setstore [storeId]             Sets the store.
    addaddress|addaddr [options]   Adds an address to your account.
    addcart|ac [options]           Adds cart entry.
    mkorder                        Places the order.
    dropcart                       Empties the cart.
    lscart                         Lists all cart items.
    item|i [itemCode]              Gets menu item info.
    ls                             Lists stores for current address.
    logout|lo                      Removes all local data.
    setaddr [addressId]            Sets the current address.
    lsaddr                         Lists the current user's addresses.
    user|u                         Shows current user info.

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
