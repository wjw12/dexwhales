import './App.css';

export default function Tip() {
    function makeTip(value) {
        var web3 = window.web3
        if (typeof web3 === 'undefined') {
            return alert('You need to install MetaMask to use this feature.  https://metamask.io')
        }

        var user_address = web3.eth.accounts[0]

        if (!user_address) {
            return alert('Please connect with your wallet')
        }
        web3.eth.sendTransaction({
            to: '0x108616595d907Fe2e6E60DAC7004f96E14dA69Ba',
            from: user_address,
            value: web3.toWei(value, 'ether')
        }, function (err, transactionHash) {
        if (err) return alert('Oops: ' + err.message)
        alert('Thank you!')
        })    
    }


    return (
        <div style={{
            position: 'fixed',
            right: '15px',
            bottom: '10px',
            fontSize: '12px',
            lineHeight: '10px',
            textAlign: 'right'
        }}>
            <p className="compact-paragraph">
            🌞 Tip me:
            </p>
            <p className="compact-paragraph">
                <a href="/#" onClick={() => makeTip(0.001)}>Ξ0.001</a>
            </p>
            <p className="compact-paragraph">
                <a href="/#" onClick={() => makeTip(0.01)}>Ξ0.010</a>
            </p>
            <p className="compact-paragraph">
                <a href="/#" onClick={() => makeTip(0.1)}>Ξ0.100</a>
            </p>
            <p className="compact-paragraph">
                <a href="/#" onClick={() => makeTip(1)}>Ξ1.000</a>
            </p>
            <p className="compact-paragraph">
                Developer: <a href="https://twitter.com/artoriamaster">Twitter</a>
            </p>
            <p className="compact-paragraph">
                Twitter Bot: <a href="https://twitter.com/dex_whales">Twitter</a>
            </p>
            <p className="compact-paragraph">
                Github: <a href="https://github.com/wjw12/dexwhales">Twitter</a>
            </p>

        </div>
    )
}