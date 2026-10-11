import { ROOTIFY_KNOWLEDGE } from './knowledge.js';

// Build the comprehensive system prompt for Rootify
export function buildSystemPrompt(context = {}) {
  const role = context.role || 'customer';
  const userName = context.userName ? ` The user's name is ${context.userName}.` : '';
  const currentTaluka = context.currentTaluka || 'Tiswadi';
  const cartInfo = context.cartItems && context.cartItems.length > 0
    ? `Current Cart (${context.cartItems.length} items from vendor "${context.cartItems[0]?.vendorName || 'Artisan'}"): ` +
      context.cartItems.map(i => `${i.name} x${i.quantity} (₹${i.price})`).join(', ') +
      ` | Subtotal: ₹${context.cartSubtotal || 0}`
    : 'Cart is currently empty.';

  const ordersInfo = context.activeOrders && context.activeOrders.length > 0
    ? `User Active Orders: ` + context.activeOrders.map(o => `Order #${o.orderNumber} (Status: ${o.status}, Total: ₹${o.total})`).join('; ')
    : 'No active orders placed yet.';

  return `You are "Rooty", the friendly, knowledgeable, and culturally authentic AI Guide & Assistant for "ROOTIFY — Authentic Goan Regional Marketplace" in Goa, India.

${userName}
Current User Role: ${role.toUpperCase()}
Selected Customer Location: ${currentTaluka} Taluka, Goa
${cartInfo}
${ordersInfo}

### ABOUT ROOTIFY:
- Mission: Connect conscious consumers and Goan households directly with genuine local Goan artisans, village bakers (poder), women's Self-Help Groups (SHGs / Mahila Mandals), spice makers, and traditional producers across all 12 Goan talukas.
- Platform Philosophy: Preserving heritage Goan recipes (susegad spirit, wood-fired clay ovens, stone-ground rogddo spices, dark coconut palm jaggery, toddy vinegar) without industrial shortcuts or preservatives.
- Single-Vendor Cart Policy: To guarantee peak freshness, each cart checkout is sourced directly from one artisanal vendor at a time.
- Payment Methods: UPI and Cash on Delivery (COD).
- 7 Order Stages: PLACED -> ACCEPTED -> PREPARING -> READY_FOR_PICKUP -> PICKED_UP -> OUT_FOR_DELIVERY -> DELIVERED.
- Vendor Onboarding: Requires local Panchayat NOC, trade license, or registered SHG certificate, plus FSSAI. Rootify charges a fair 5% platform commission to power local delivery logistics.

### KEY PRODUCT HIGHLIGHTS & VENDORS IN ROOTIFY:
1. Royal 7-Layer Goan Bebinca (₹380, Maria's Traditional Foods, Guirim, Bardez): Slow-baked layer by layer over coconut husks for 5 hours using fresh coconut milk, egg yolks, nutmeg, and pure cow ghee.
2. Artisanal Goan Dodol (₹320, Maria's Traditional Foods, Guirim, Bardez): Rich, soft jelly confection crafted from pure coconut milk, red rice flour, cashew nuts, and dark coconut palm jaggery (maddachem godd).
3. Prawn Balchão & Xacuti Masala (Divar Island Mahila Mandal SHG, Tiswadi): 18-women cooperative grinding local spices on stone mills (rogddo) with dried prawns and Goan coconut vinegar. 100% preservative-free.
4. Traditional Smoked Goan Choriz (Father & Son Smoked Meats, Curtorim, Salcete): Naturally cured pork sausages spiced with Goan feni vinegar and Kashmiri chilies.
5. Fresh Wood-Fired Poee (Bakers Guild, Santa Cruz, Tiswadi): Authentic village poee bread with whole wheat pocket.
6. Roasted Cashews W240 (Valpoi Collective, Sattari): Slow-roasted whole Goan cashews.
7. Pure Kokum Agal / Concentrate (Canacona Forest Collective): Tangy, unsweetened garcinia indica extract for fish curries and sol kadhi.

### SERVICEABLE GOA TALUKAS:
Tiswadi (Panaji, Divar), Bardez (Mapusa, Calangute, Porvorim), Salcete (Margao, Raia), Ponda, Mormugao (Vasco), Pernem, Bicholim, Sattari, Quepem, Sanguem, Canacona, Dharbandora.

### YOUR BEHAVIOR & GUIDELINES:
1. Warm, Hospitable, Goan Tone: Welcoming, courteous, helpful. You may gently include authentic Goan touches (e.g. "Dev borem korum" for thank you/blessings, "Susegad", "Kitem zai?"), but speak in clear, natural English.
2. Accurate & Grounded: Never invent products, fake discounts, or impossible delivery promises outside Goa. Stick to Rootify's actual catalog and policies.
3. Helpful App Navigation: If recommending an action, provide markdown links:
   - [Browse Goan Sweets](/explore?category=sweets)
   - [Explore All Products](/explore)
   - [View Cart](/cart)
   - [Track Orders](/orders)
   - [Vendor Registration](/vendor/register) (if user asks about selling)
4. Context Awareness: Address the user's specific role, cart contents, active orders, or location if relevant.
5. Formatting: Use concise bullet points, bold product names, and clear formatting. Keep responses focused and readable.`;
}

// Check which AI provider is configured
export function getAIStatus() {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    return { status: 'online', provider: 'gemini', model: 'gemini-2.5-flash', hasApiKey: true };
  } else if (openaiKey) {
    return { status: 'online', provider: 'openai', model: process.env.OPENAI_MODEL || 'gpt-4o-mini', hasApiKey: true };
  } else {
    return { status: 'online', provider: 'rootify-engine', model: 'Rootify Goan Knowledge Assistant', hasApiKey: false };
  }
}

// Call Google Gemini API
async function callGemini(apiKey, messages, context) {
  const systemPrompt = buildSystemPrompt(context);

  // Map messages to Gemini format: role 'user' | 'model'
  const contents = [];
  for (const msg of messages) {
    const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
    contents.push({
      role: role,
      parts: [{ text: msg.content }]
    });
  }

  // Ensure last message is from user
  if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
    throw new Error('Latest message must be from user.');
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const payload = {
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1200
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.text();
    // Fallback to gemini-1.5-flash if 2.5-flash model name differs
    if (model !== 'gemini-1.5-flash' && response.status === 404) {
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const fbResponse = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (fbResponse.ok) {
        const fbData = await fbResponse.json();
        const candidate = fbData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return { reply: candidate, provider: 'gemini', model: 'gemini-1.5-flash' };
      }
    }
    throw new Error(`Gemini API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error('No response text returned by Gemini API.');
  }

  return { reply, provider: 'gemini', model: model };
}

// Call OpenAI API
async function callOpenAI(apiKey, messages, context) {
  const systemPrompt = buildSystemPrompt(context);
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.content
    }))
  ];

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: formattedMessages,
      temperature: 0.7,
      max_tokens: 1200
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorData}`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  return { reply, provider: 'openai', model: model };
}

// Domain-grounded fallback assistant for Rootify
export function generateLocalGroundedResponse(userQuery, context = {}) {
  const q = userQuery.toLowerCase();
  const role = context.role || 'customer';
  const taluka = context.currentTaluka || 'Tiswadi';

  // 1. Bebinca queries
  if (q.includes('bebinca') || q.includes('layer')) {
    return {
      reply: `**Royal 7-Layer Goan Bebinca** is the queen of Goan desserts! 🍮\n\n- **Prepared by:** **Maria's Traditional Foods** (Guirim, Bardez, North Goa)\n- **Traditional Craft:** Hand-baked layer by layer over coconut husks for 5 hours, allowing each caramel layer to achieve perfection.\n- **Ingredients:** Pure coconut milk extracted daily, egg yolks, refined flour, pure cow ghee, nutmeg, and cardamom.\n- **Price:** ₹380 per 500g Box (Shelf life: 14 days at room temperature).\n- **Verification:** Verified Origin Stamp & FSSAI certified.\n\n👉 [Explore Goan Sweets](/explore?category=sweets) or check the product page directly!`,
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence'
    };
  }

  // 2. Dodol queries
  if (q.includes('dodol') || q.includes('jaggery') || q.includes('maddachem')) {
    return {
      reply: `**Artisanal Goan Dodol** is an heirloom confection made using dark coconut palm jaggery (*maddachem godd*):\n\n- **Prepared by:** **Maria's Traditional Foods** (Guirim, Bardez)\n- **Texture & Flavor:** Velvety, melt-in-the-mouth texture with rich, smoky coconut palm sweetness and crunchy Goan cashews.\n- **Price:** ₹320 (500g Pack).\n- **Traditional Secret:** Slow-stirred in heavy copper vessels (*urli*) with thick coconut cream and red rice flour.\n\n👉 [Browse Goan Sweets](/explore?category=sweets)`,
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence'
    };
  }

  // 3. Divar Island / SHG / Spices
  if (q.includes('divar') || q.includes('shg') || q.includes('mahila mandal') || q.includes('spice') || q.includes('xacuti') || q.includes('balchao') || q.includes('balchão')) {
    return {
      reply: `**Divar Island Mahila Mandal SHG** is a proud cooperative of 18 village women from Piedade, Divar Island:\n\n- **Signature Products:**\n  - **Stone-Ground Goan Xacuti Masala** (₹160 / 200g) — Roasted grated coconut, stone-ground peppercorns, star anise, and whole spices.\n  - **Heritage Prawn Balchão** (₹340 / 300g) — Dried coastal prawns pickled with Goan coconut feni vinegar and stone-ground Kashmiri chilies.\n  - **Fiery Recheado Paste** (₹140 / 250g) — Heritage paste for mackerel and pomfret fry.\n- **Authenticity:** Grinded on traditional stone mills (*rogddo*) without chemical additives or preservatives.\n\n👉 [Explore Spices & Masalas](/explore?category=spices)`,
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence'
    };
  }

  // 4. Delivery / Taluka / Serviceability
  if (q.includes('deliver') || q.includes('taluka') || q.includes('location') || q.includes('area') || q.includes('reach') || q.includes('panaji') || q.includes('mapusa') || q.includes('margao')) {
    return {
      reply: `🚚 **Rootify Delivery Network across Goa:**\n\nWe deliver fresh artisanal produce across **North & South Goa**:\n- **Currently Selected Taluka:** **${taluka}**\n- **Primary Hubs:** Panaji, Mapusa, Margao, Ponda, Vasco, Calangute, Porvorim, Candolim.\n- **Estimated Delivery Timelines:**\n  - Intra-Taluka: 25 - 40 minutes\n  - Inter-Taluka / Cross-District: 45 - 75 minutes\n\n*Single-Vendor Note:* To protect artisanal food quality, each order arrives fresh directly from that vendor's village kitchen.`,
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence'
    };
  }

  // 5. Order Tracking / My Orders
  if (q.includes('order') || q.includes('track') || q.includes('status')) {
    if (context.activeOrders && context.activeOrders.length > 0) {
      const orderList = context.activeOrders.map(o => `• **Order #${o.orderNumber}:** Currently **${o.status}** (Total: ₹${o.total})`).join('\n');
      return {
        reply: `📦 **Your Active Orders:**\n\n${orderList}\n\n**The 7 Order Stages:**\n1. \`PLACED\` ➔ 2. \`ACCEPTED\` ➔ 3. \`PREPARING\` ➔ 4. \`READY_FOR_PICKUP\` ➔ 5. \`PICKED_UP\` ➔ 6. \`OUT_FOR_DELIVERY\` ➔ 7. \`DELIVERED\`\n\n👉 You can view live real-time status and delivery partner details in [My Orders](/orders).`,
        provider: 'rootify-engine',
        model: 'Rootify Domain Intelligence'
      };
    }
    return {
      reply: `📦 **Order Tracking on Rootify:**\n\nEvery order updates in real time through 7 distinct stages:\n1. **PLACED** (Customer confirms with UPI or COD)\n2. **ACCEPTED** (Artisan reviews fresh order)\n3. **PREPARING** (Fresh baking, packing, or bottling)\n4. **READY_FOR_PICKUP** (Waiting for local delivery partner)\n5. **PICKED_UP** (En route from village kitchen)\n6. **OUT_FOR_DELIVERY** (Final transit to your doorstep)\n7. **DELIVERED** (Handed over)\n\n👉 View your past and active orders in [My Orders](/orders).`,
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence'
    };
  }

  // 6. Vendor registration / How to sell
  if (q.includes('vendor') || q.includes('sell') || q.includes('join') || q.includes('onboard') || q.includes('shg register') || q.includes('commission')) {
    return {
      reply: `👩‍🍳 **Selling on Rootify as a Goan Producer / SHG:**\n\nWe welcome local traditional artisans, home cooks, bakers, and Self-Help Groups!\n\n- **Onboarding Requirements:**\n  1. Village Panchayat Trade NOC or Municipality License\n  2. FSSAI Food Safety Certificate or SHG Registration Certificate\n  3. Authentic origin & traditional preparation details\n- **Platform Fee:** Rootify charges a fair **5% platform commission**; the remaining 95% goes directly to the local artisan.\n- **Settlement Timeline:** Vendor payouts become eligible once the return window closes post-delivery.\n\n👉 Ready to register? Go to [Vendor Registration](/vendor/register) to get started!`,
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence'
    };
  }

  // 7. Cart / Checkout queries
  if (q.includes('cart') || q.includes('buy') || q.includes('checkout') || q.includes('payment')) {
    if (context.cartItems && context.cartItems.length > 0) {
      return {
        reply: `🛒 **Your Current Cart:**\n\nYou currently have **${context.cartItems.length} items** in your cart from vendor **"${context.cartItems[0]?.vendorName}"** totaling **₹${context.cartSubtotal || 0}**.\n\n- **Payment Options:** UPI (Instant GooglePay/PhonePe/PayTM) and Cash on Delivery (COD).\n\n👉 Ready to complete your order? Go to [Checkout Page](/checkout) or view [My Cart](/cart).`,
        provider: 'rootify-engine',
        model: 'Rootify Domain Intelligence'
      };
    }
    return {
      reply: `🛒 **Shopping & Cart on Rootify:**\n\n- **Single-Vendor Fresh Policy:** Because our village artisans bake and prepare fresh to order, each cart checkout is sourced from one artisan at a time.\n- **Payment Modes:** Supported via UPI and Cash on Delivery (COD).\n\n👉 Browse authentic products on the [Explore Page](/explore) and add items to your cart!`,
      provider: 'rootify-engine',
      model: 'Rootify Domain Intelligence'
    };
  }

  // 8. General Greeting or Overview
  return {
    reply: `*Mog Asum!* (Welcome!) I am **Rooty**, your authentic Goan marketplace guide on **ROOTIFY**. 🌿\n\nHere are some things I can assist you with:\n- 🍮 **Goan Sweets & Delicacies:** Ask about authentic 7-layer Bebinca, Dodol, or Bolinhas.\n- 🌶️ **Spices & Preserves:** Learn about stone-ground Xacuti masala or Prawn Balchão from the Divar Island Mahila Mandal SHG.\n- 🚚 **Delivery Coverage:** Check delivery times across North and South Goa talukas.\n- 📦 **Order Lifecycle:** Track your active orders from preparation to your door.\n- 👩‍🍳 **Vendor Portal:** Information on how local producers and SHGs can join.\n\n*What would you like to explore today?*`,
    provider: 'rootify-engine',
    model: 'Rootify Domain Intelligence'
  };
}

// Main handler entry point
export async function handleChatRequest(messages, context = {}) {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      return await callGemini(geminiKey, messages, context);
    } catch (err) {
      console.warn('[Rooty AI] Gemini API call failed, falling back to Rootify domain intelligence:', err.message);
      const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      const fallback = generateLocalGroundedResponse(latestUserMessage, context);
      fallback.reply += `\n\n*(Note: Gemini API temporarily unavailable: ${err.message}. Showing verified Rootify marketplace knowledge.)*`;
      return fallback;
    }
  } else if (openaiKey) {
    try {
      return await callOpenAI(openaiKey, messages, context);
    } catch (err) {
      console.warn('[Rooty AI] OpenAI API call failed, falling back to Rootify domain intelligence:', err.message);
      const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
      const fallback = generateLocalGroundedResponse(latestUserMessage, context);
      fallback.reply += `\n\n*(Note: OpenAI API temporarily unavailable: ${err.message}. Showing verified Rootify marketplace knowledge.)*`;
      return fallback;
    }
  } else {
    // Grounded smart assistant
    const latestUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    return generateLocalGroundedResponse(latestUserMessage, context);
  }
}
