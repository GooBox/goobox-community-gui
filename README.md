
# goobox-community-gui
[![Build Status](https://travis-ci.org/GooBox/goobox-community-gui.svg?branch=master)](https://travis-ci.org/GooBox/goobox-community-gui)
[![Build status](https://ci.appveyor.com/api/projects/status/clxcy4bumhqd0iub/branch/master?svg=true)](https://ci.appveyor.com/project/jkawamoto/goobox-community-gui/branch/master)
[![Coverage Status](https://coveralls.io/repos/github/GooBox/goobox-community-gui/badge.svg)](https://coveralls.io/github/GooBox/goobox-community-gui)

Goobox community edition sync app for sia and storj 🎉🚀

**Upcoming features and fixes:**

-	Linux and Mac support.
-	Settings menu with some basic features like auto-start
-	Design update
-	Minor bug fixes
-	Sia file Sharing (once implemented in sia-core).

# QuickStart

1.	If you are on windows, check if you have Dropbox, OneDrive or any other sync application installed that uses file status overlay icons. If so, the overlays of the app will most likely not work, to solve this issue uninstall these programs to free up the overlay registry slots.

2.	Go to the [release page]( https://github.com/GooBox/goobox-community-gui/releases) and download the latest executable.

3.	Install it.

4.	A setup screen will appear after installation.

5.	On the setup screen press ‘next’, this will install the necessary tools for Goobox to be able to run.

6.	Select your favorite cloud storage provider.

7.	Now select which folder on your computer you want to set as the sync folder. All the files inside this folder are automatically synchronized to the cloud. The default sync folder is located in `USER` -> `Goobox`. You can leave it at default and click next.

8.	In the case Sia was selected, it will generate a wallet address and seed for you automatically, store these in a very safe location and don’t forget them. In the case Storj is selected, either login or register a new account. If registering a Storj account, don’t forget to confirm your account through the email you received before logging in again through the app.

9.	Regarding funds management, if Sia was selected, make sure you send at least 10$ worth of Sia tokens (excluding transaction fees) to your wallet address given by goobox, this should cover the initial contract negotiation costs and give you some initial funds. In the case of Storj, you are limited by the free tier of 25GB, thus if you want to upload beyond this, make sure you add some credit to [app.storj.io](app.storj.io).

10.	Click next.

11.	If you selected the Sia service, the app will now prepare your account in the background, if enough funds have been sent to the address there is nothing more you have to do. It will download the blockchain and create the necessary storage contracts. All received funds to this address will automatically be allocated for storage. Once enough funds have been allocated you will be notified about this too. You can already drag and drop the files you want to synchronize to the Goobox sync-directory, they will automatically start synchronizing once the background preparations are completed. Note that depending on your computer resources and internet speed, the first setup can take up to 24h to complete. If the Storj service is selected no waiting time is required and files will immediately start synchronizing to the Storj cloud.

**Note** that in the case of Sia, you can only sync files on a single machine until seed-based file recovery is implemented by Sia-core. Though, of course you can run the app on more computers. In the case of Storj, you can run the app on as many machines as you like and sync the files between them.
Code issues can be opened [here]( https://github.com/GooBox/goobox-community-gui/issues). For any other information or questions please join our communication channels linked at the end of this page.


# Introduction

Goobox-community-gui is a desktop file synchronization application that allows anyone with a minimum amount of blockchain experience to safely store their files on the blockchain based cloud storage platform that they desire. Currently the supported storage providers include(s) Sia and Storj. The application communicates natively and directly with the platform(s) API’s, thus no data or information is ever transmitted to any third party. Only you have access to your files.
We hope that with this application we can make these platforms more accessible and in the process help execute the amazing vision that these technologies and their communities brings us.
Although we highly believe that software should speak for itself, we will walk through the setup of the app step by step and elaborate on each step for those that would like a bit more details.

# Some general remarks

- This app is not a wallet.
- losing the encryption keys/seed will mean the loss of all files.
- In the case of Sia the app will not sync any files if no funds are allocated.
- If Goobox is offline for too long you risk losing your files stored on Sia. At a minimum, turn goobox on a hour or so a month.
- If you reach the Storj free tier limit, the files will stop synchronizing.

# Downloading and installing Goobox

The latest release can be downloaded from our main github release page [here]( https://github.com/GooBox/goobox-community-gui/releases). Make sure you download the latest release. If a release is not available for your operating system please contact us through one of the available support channels linked at the bottom of this page.

## Windows installation

On windows, check if you have Dropbox, OneDrive or any other sync application installed that uses file status overlay icons. If so, the overlays of the app will most likely not work, to solve this issue uninstall these programs to free up the overlay registry slots.

After downloading the executable double click on it to launch it. You will be prompted by Microsoft security alert, don’t worry, click on allow. Once we sign the executable in a few weeks this security alert will be gone. It will then prompt for administration privileges.

# Goobox setup

After the installation is completed a setup screen will appear (Figure 1). On the welcome screen press ‘Next’.


![](https://i.imgur.com/2CQmOAa.png)

**Figure 1.** Welcome screen.


Goobox will now download and install the necessary tools to run the app (Figure 2). This normally only takes a minute or so but it highly dependent on your internet and computer speed.


![](https://i.imgur.com/LqnuruS.png)

**Figure 2.** Installations of the necessary tools to run the app.


Once the tools are downloaded and installed successfully you will now be able to select your favorite cloud storage platforms that you want to sync your files too.


![](https://i.imgur.com/lsRbvUc.png)


**Figure 3.** Select your cloud storage platforms platform.


Next select the folder you want to set as your synchronization directory (Figure 4). All files inside of this directory will be synchronized to your favorite cloud storage platform automatically. You can leave it at default and click ‘Next’, this will create a sync folder in your home directory. Goobox will also synchronize your files automatically every time you change or update them.


![](https://i.imgur.com/J7Y4LBY.png)


**Figure 4.** Select your synchronization directory. You can leave it at default and click ‘next’.


In the case Sia was selected follow the steps below. In the case Storj was selected skip these steps and head down to the respective Storj section.
Goobox will now automatically create and configure a unique Sia wallet for you (Figure 5). This can take a minute or two.


![](https://i.imgur.com/nrSxl0M.png)


**Figure 5.** Setting up your Sia wallet.


After your wallet is configured correctly the app should present the wallet details on screen (Figure 6). Save your wallet address and seed in a secure location that only you have access too. Click ‘Next’.


![](https://i.imgur.com/gYwpK2h.png)


**Figure 6.** Sia wallet details.

You are all done for the setup part!. Goobox will now start preparing Sia in the background. This first setup depending on your computer normally takes anywhere from 12-24h. You are notified by Goobox when done. In the mean time you can already drop files to your sync folder, furthermore we also advise you to already deposit 10$ worth of Sia tokens to your address provided above, this will ensure the app can automatically start synchronizing your files once Sia is finished with setting up your account. You will be notified once the funds are allocated successfully too. Goobox always keeps you updated on any important implications of your Sia account, this includes when the funds start running out.


![](https://i.imgur.com/mdPzwHh.png)

**Figure 7.** Setup complete, Goobox will now get Sia ready in the background. You are notified when done.


After Storj is selected the login screen will appear. If you already have a Storj account enter your email, password and the encryption key in the respective fields and click ‘Finish’. You are now all done and Goobox will automatically stat synchronizing your files.


![](https://i.imgur.com/nOrsOLb.png)

**Figure 8.** Storj login screen.


If on the other hand you do not have a Storj account yet, in the screen above click on ‘click here to create’ to create an account. On the registration screen enter your email address and password and click ‘Next’ (figure 9).


![](https://i.imgur.com/4fWzp9n.png)

**Figure 9.** Storj account registration screen.


The next screen will return a encryption key, save it to a safe location that only you have access to (Figure 10).


![](https://i.imgur.com/FNeT75q.png)

**Figure 10.** save the Storj encryption key to a safe location.


Now check your email address and confirm your Storj account by clicking on the provided link in the email. Click on ‘Login’ (Figure 11).


![](https://i.imgur.com/lW8l3QR.png)

**Figure 11.** Confirm your Storj account.


Now login into to your newly created Storj account by entering your email, password and encryption key into the respective fields.

After successful login you should now see the screen above, you can click on ‘Close’. Congrats!, you are all done and your files will start synchronizing to Storj.

![](https://i.imgur.com/KiXHKkU.png)

# Some info for developers

- The front-end is electron/ReactJS based, while it the back-ends are built in Java.
- Both the Sia and Storj sync back-ends are separate modules that communicate with the GUI. This makes it easier to develop on each back-end separately.
- A number of DLLs are installed to the system for namely the overlay icons.
- To build executable packages, [wine](https://www.winehq.org/)(>=1.8) and nodejs are required.

To install the app from source follow the steps below:

1. Download the latest [source code](https://github.com/GooBox/goobox-community-gui/releases) or clone this repository.
2. In the extracted folder execute:

	- `npm install`
	- `npm run build`
	- `npm run dist:pre`
	- `npm run pack`

3. Compiled binaries are stored in `dist`.

Done

# Troubleshooting

## Windows

Goobox stores configuration and log files in two important places on windows:

- `C:\Users\USER\AppData\Local\Goobox`
- `C:\Users\meije\AppData\Roaming\Goobox`

In case any errors or unexpected app behavior occurs like for example crashes, missing overlay icons... please either open a [issue on github](https://github.com/GooBox/goobox-community-gui/issues/new) or provide us with the following logs through one of our support channels (linked at the bottom of this page):

- `C:\Users\USER\AppData\Roaming\Goobox\log.log`
- All logs in `C:\Users\USER\AppData\Local\Goobox\Logs`

-------------------------------------------------------------------------------

The following files and directories can also be important for troubleshooting:

- All the Sia node data is stored in the following directory: `C:\Users\USER\AppData\Local\Goobox\sia`

- The Sia database is stored here: `C:\Users\USER\AppData\Local\Goobox\sync.sia.db`
(consult [goobox-sync-sia](https://github.com/GooBox/goobox-sync-sia/blob/master/README.md) for DB content dump command to stdout).

- `C:\Users\USER\AppData\Local\Goobox\goobox.properties` contains your account details.

- The goobox config file can be found here: `C:\Users\USER\AppData\Roaming\Goobox\storage\config.json`

- Java Runtime environment is installed here: `C:\Users\USER\AppData\Roaming\Goobox\jre`

# Contributions

As this is a free and open-source app there are plenty of ways you can contribute to this project, including:

1.	Spread the word and share the app with others!, it is the single most important thing that you can do to help this project and ecosystem in general become a success.

2.	Give us your feedback, tell us what you like, what you don’t like, what you are having issues with and what you would like to see added to the app, this will help us improve the app so that you can focus on the things that matter.

3.	There are many development tasks that can be tackled, from adding new features, fixing existing bugs to running tests.

4.	If you are a designer, share your ideas with us, have a look at the [design and branding repository]( https://github.com/GooBox/brand-design) on github. Open a issue, get in touch with us or submit a pull request for a design change!

# Donations

Every single cent of the received funds will be spent on development to make the app better. All received funds will only be spent on this app alone and will not be spend on any other aspects of this project or adjacent services.

Sia: 2401f57067601d32cdac17e5281a0d93b84519cc751fd35511ead7c0ee647c5c4e479a049331

Storj: 0x78d1fd828a874b40afba13d37238da5553ec3156

# Communication channels

[Discord]( https://discord.gg/9pShaGj)

[Twitter]( https://twitter.com/gooboxCloud)

[Slack]( https://join.slack.com/t/goobox/shared_invite/enQtMjY2NzEwNTA3MjA0LTBkZWQwOWY1MmRjMWJiMDI1NzhlODQ4OWJlNzViYjI5MTQ2YTlkMjRlYTE0ZjA2MzBmOGU4ZGZhYTRkYjg1NTE)

[reddit]( reddit.com/r/goobox)

May the force be with you,

The Goobox team
