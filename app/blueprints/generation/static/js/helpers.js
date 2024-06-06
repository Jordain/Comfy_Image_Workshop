async function get_local_ip() {
    try {
        const response = await fetch('/generation/local_ip');
        const data = await response.json();
        const localIp = data.local_ip;
        console.log('Local IP Address:', localIp);
        return localIp;
    } catch (error) {
        console.error('Error:', error);
        return null; // or handle the error as needed
    }
}