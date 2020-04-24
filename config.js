module.exports = {
	thetaAddress: process.env.THETA_CURRENT_IP || "192.168.1.214",
	ssid: process.env.WLAN_SSID || "CHANGE_ME_IN_DOT_ENV",
	password: process.env.WLAN_PASSWORD || "CHANGE_ME_IN_DOT_ENV",
	ipAddress: process.env.WLAN_THETA_IP || "192.168.1.214",
	subnetMask: process.env.WLAN_SUBNET_MASK || "255.255.255.0",
	defaultGateway: process.env.WLAN_GATEWAY || "192.168.1.1",
};
