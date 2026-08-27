function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-6 py-4">

      <div className="text-center">

        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} Sistema Integral de Bitácoras v1.0
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Sistema Municipal DIF
        </p>

      </div>

    </footer>
  );
}

export default Footer;