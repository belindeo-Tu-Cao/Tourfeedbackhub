/**
 * Populate Vietnamese (`vi`) translations for Payload localized content.
 *
 * The seed baseline-copies EN -> other locales (see seed.ts LOCALIZED_FIELDS),
 * so every `vi` field currently holds English text and the site renders English
 * even after switching to /vi. This script overwrites the `vi` locale values of
 * the public-facing collections with real Vietnamese, matched by natural keys
 * (slug / code / order / nav href) so it is idempotent and id-independent.
 *
 * Run: npm run translate:vi
 *
 * Only `vi` is handled here; other locales are translated separately.
 */
import { getPayload, type Payload } from 'payload'
import config from './payload.config'

const LOCALE = 'vi' as const

// Build a single-paragraph Lexical richText value (mirrors seed.ts `richText`).
function richText(text: string) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          direction: 'ltr',
          children: [
            {
              mode: 'normal',
              text,
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
        },
      ],
    },
  }
}

type Dict = Record<string, unknown>

async function findOne(payload: Payload, collection: string, where: Dict): Promise<Dict | null> {
  const res = await payload.find({
    collection: collection as never,
    where: where as never,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
    limit: 1,
  })
  return (res.docs[0] as Dict) ?? null
}

async function updateVi(payload: Payload, collection: string, id: unknown, data: Dict) {
  await payload.update({
    collection: collection as never,
    id: id as never,
    locale: LOCALE,
    data: data as never,
    depth: 0,
  })
}

// --- Navigation menus (items[].label) — matched by href -------------------
const NAV_LABELS: Record<string, string> = {
  '/': 'Trang chủ',
  '/tours': 'Tour',
  '/destinations': 'Điểm đến',
  '/guides': 'Hướng dẫn viên',
  '/reviews': 'Đánh giá',
  '/stories': 'Câu chuyện',
  '/blog': 'Blog',
  '/faq': 'Câu hỏi thường gặp',
  '/contact': 'Liên hệ',
  '/privacy': 'Chính sách bảo mật',
  '/terms': 'Điều khoản dịch vụ',
  '/feedback': 'Gửi phản hồi',
}

async function translateNav(payload: Payload) {
  const res = await payload.find({
    collection: 'navigation-menus' as never,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
    limit: 100,
  })
  for (const doc of res.docs as Dict[]) {
    const items = Array.isArray(doc.items) ? (doc.items as Dict[]) : []
    const translated = items.map((it) => ({
      ...it,
      label: NAV_LABELS[String(it.href)] ?? it.label,
    }))
    await updateVi(payload, 'navigation-menus', doc.id, { items: translated })
  }
  console.log(`nav menus translated (${res.docs.length})`)
}

// --- Site settings (singleton) --------------------------------------------
async function translateSiteSettings(payload: Payload) {
  const res = await payload.find({
    collection: 'site-settings' as never,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
    limit: 1,
  })
  const doc = res.docs[0] as Dict | undefined
  if (!doc) return
  await updateVi(payload, 'site-settings', doc.id, {
    heroTitle: 'Khám phá Việt Nam cùng chuyên gia bản địa',
    heroSubtitle: 'Tour chân thực do hướng dẫn viên dẫn dắt và phản hồi trung thực từ du khách.',
    aboutTitle: 'Về Tour Insights Hub',
    aboutDescription:
      'Chúng tôi kết nối du khách với những hướng dẫn viên bản địa đáng tin cậy trên khắp Việt Nam và thu thập phản hồi đã xác minh để duy trì chất lượng.',
    missionStatement: 'Những chuyến tour tốt hơn nhờ phản hồi trung thực, minh bạch từ du khách.',
  })
  console.log('site settings translated')
}

// --- Slides (matched by English title) ------------------------------------
const SLIDES: Record<string, { title: string; subtitle: string; buttonText: string }> = {
  'Discover Vietnam with Local Experts': {
    title: 'Khám phá Việt Nam cùng chuyên gia bản địa',
    subtitle: 'Những chuyến tour chân thực được dẫn dắt bởi chính người dân bản địa.',
    buttonText: 'Xem các tour',
  },
  'Real Feedback from Real Travelers': {
    title: 'Phản hồi thật từ du khách thật',
    subtitle: 'Đọc các đánh giá đã xác minh trước khi đặt tour.',
    buttonText: 'Xem đánh giá',
  },
}

async function translateSlides(payload: Payload) {
  const res = await payload.find({
    collection: 'slides' as never,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
    limit: 100,
  })
  let n = 0
  for (const doc of res.docs as Dict[]) {
    const t = SLIDES[String(doc.title)]
    if (!t) continue
    await updateVi(payload, 'slides', doc.id, t)
    n++
  }
  console.log(`slides translated (${n})`)
}

// --- Tour types (matched by slug) -----------------------------------------
const TOUR_TYPES: Record<string, { title: string; description: string }> = {
  beach: { title: 'Biển', description: 'Nghỉ dưỡng ven biển và khám phá đảo.' },
  city: { title: 'Thành phố', description: 'Đi bộ có hướng dẫn qua các trung tâm phố cổ lịch sử.' },
  nature: { title: 'Thiên nhiên', description: 'Vườn quốc gia, hang động và cảnh quan hùng vĩ.' },
  'food-culinary': { title: 'Ẩm thực', description: 'Tour ẩm thực đường phố và lớp học nấu ăn.' },
  adventure: { title: 'Mạo hiểm', description: 'Trekking, chèo kayak và những cung đường ít người biết.' },
  cultural: { title: 'Văn hóa', description: 'Đền chùa, di sản và truyền thống địa phương.' },
}

async function translateTourTypes(payload: Payload) {
  let n = 0
  for (const [slug, t] of Object.entries(TOUR_TYPES)) {
    const doc = await findOne(payload, 'tour-types', { slug: { equals: slug } })
    if (!doc) continue
    await updateVi(payload, 'tour-types', doc.id, t)
    n++
  }
  console.log(`tour types translated (${n})`)
}

// --- Tours (matched by code) ----------------------------------------------
const TOURS: Record<string, { name: string; summary: string; itinerary: string }> = {
  'HAN-001': {
    name: 'Dạo Phố Cổ Hà Nội & Ẩm Thực Đường Phố',
    summary: 'Tour đi bộ nửa ngày qua Phố Cổ nhộn nhịp kèm nếm thử ẩm thực.',
    itinerary: 'Hồ Hoàn Kiếm → 36 Phố Phường → Cà phê trứng → Bữa trưa bún chả.',
  },
  'DAD-002': {
    name: 'Phố Cổ Hội An & Đêm Đèn Lồng',
    summary: 'Khám phá Hội An được UNESCO công nhận và tận hưởng bờ sông rực rỡ đèn lồng.',
    itinerary: 'Chùa Cầu → Phố may đo → Đi thuyền → Thả đèn hoa đăng.',
  },
  'NBH-003': {
    name: 'Hành Trình Thuyền & Hang Động Tràng An Ninh Bình',
    summary: 'Chuyến khám phá thiên nhiên trọn ngày chèo thuyền qua núi đá vôi và hang động.',
    itinerary: 'Thuyền Tràng An → Đỉnh Hang Múa → Chùa Bích Động.',
  },
  'SGN-004': {
    name: 'Điểm Nhấn Sài Gòn & Địa Đạo Củ Chi',
    summary: 'Tour trong ngày tập trung vào lịch sử của Thành phố Hồ Chí Minh và Địa đạo Củ Chi.',
    itinerary: 'Bảo tàng Chứng tích Chiến tranh → Dinh Độc Lập → Địa đạo Củ Chi.',
  },
}

async function translateTours(payload: Payload) {
  let n = 0
  for (const [code, t] of Object.entries(TOURS)) {
    const doc = await findOne(payload, 'tours', { code: { equals: code } })
    if (!doc) continue
    await updateVi(payload, 'tours', doc.id, t)
    n++
  }
  console.log(`tours translated (${n})`)
}

// --- Stories (matched by slug) --------------------------------------------
const STORIES: Record<string, { title: string; excerpt: string; content: string }> = {
  'meet-linh-hanoi-street-food-whisperer': {
    title: 'Gặp Linh: Người Thổ Địa Ẩm Thực Đường Phố Hà Nội',
    excerpt: 'Câu chuyện phía sau một trong những hướng dẫn viên bản địa được yêu thích nhất của chúng tôi.',
    content:
      'Linh Nguyễn đã dẫn các tour ẩm thực qua Phố Cổ Hà Nội hơn năm năm, và có thể kể cho bạn câu chuyện đằng sau từng bát phở trên con phố...',
  },
  'rainy-day-best-tour-ever': {
    title: 'Ngày Mưa Trở Thành Chuyến Tour Tuyệt Nhất Như Thế Nào',
    excerpt: 'Một du khách chia sẻ cách sự linh hoạt biến một buổi chiều ướt át thành điều kỳ diệu.',
    content:
      'Dự báo nói mưa cả ngày, nhưng hướng dẫn viên Linh của chúng tôi có kế hoạch khác. Thay vì hủy tour, chúng tôi đổi lộ trình qua những ngôi chùa có mái che ở Tràng An và kết thúc bằng trà gừng nóng ngắm nhìn những dãy núi đá vôi...',
  },
}

async function translateStories(payload: Payload) {
  let n = 0
  for (const [slug, t] of Object.entries(STORIES)) {
    const doc = await findOne(payload, 'stories', { slug: { equals: slug } })
    if (!doc) continue
    await updateVi(payload, 'stories', doc.id, {
      title: t.title,
      excerpt: t.excerpt,
      content: richText(t.content),
    })
    n++
  }
  console.log(`stories translated (${n})`)
}

// --- Posts (matched by slug) ----------------------------------------------
const POSTS: Record<string, { title: string; excerpt: string; content: string }> = {
  'quang-tri-strategic-war-history-map': {
    title: 'Bản Đồ Lịch Sử Chiến Tranh Quảng Trị - 14 Địa Danh Lịch Sử',
    excerpt:
      'Khám phá 14 di tích lịch sử tiêu biểu của Quảng Trị - vùng "Đất Lửa" huyền thoại - từ Địa đạo Vịnh Mốc đến Thành cổ Quảng Trị, Căn cứ Khe Sanh và Đại lộ Kinh hoàng.',
    content:
      'Tỉnh Quảng Trị, từng là ranh giới chia cắt hai miền Nam - Bắc Việt Nam, lưu giữ một số trang sử chiến tranh quan trọng bậc nhất Đông Nam Á. Từ sông Bến Hải ở Vĩ tuyến 17 đến Đường 9, từ Địa đạo Vịnh Mốc dưới lòng đất đến Thành cổ Quảng Trị, mỗi tấc đất nơi đây đều kể một câu chuyện về lòng dũng cảm, sự hy sinh và khát vọng hòa bình bền bỉ. Bài viết này khám phá 14 địa danh lịch sử nhất định phải ghé thăm để tái hiện lịch sử chiến tranh của Việt Nam.',
  },
  about: {
    title: 'Về Chúng Tôi',
    excerpt: 'Tìm hiểu thêm về Tour Insights Hub.',
    content: 'Chúng tôi kết nối du khách với những hướng dẫn viên bản địa đáng tin cậy trên khắp Việt Nam.',
  },
  'first-timers-guide-hoi-an': {
    title: 'Cẩm Nang Hội An Cho Người Lần Đầu',
    excerpt: 'Mọi điều bạn cần biết trước khi ghé thăm phố cổ.',
    content: 'Hội An hòa quyện lịch sử, nghề may đo và những đêm rực đèn lồng thành một phố cổ quyến rũ...',
  },
  'top-10-street-foods-hanoi': {
    title: 'Top 10 Món Ăn Đường Phố Nên Thử Ở Hà Nội',
    excerpt: 'Từ phở đến cà phê trứng, đây là những món nhất định phải thử ở thủ đô.',
    content: 'Hà Nội là thiên đường cho người yêu ẩm thực. Hãy bắt đầu với một bát phở nóng hổi...',
  },
}

async function translatePosts(payload: Payload) {
  let n = 0
  for (const [slug, t] of Object.entries(POSTS)) {
    const doc = await findOne(payload, 'posts', { slug: { equals: slug } })
    if (!doc) continue
    await updateVi(payload, 'posts', doc.id, {
      title: t.title,
      excerpt: t.excerpt,
      content: richText(t.content),
    })
    n++
  }
  console.log(`posts translated (${n})`)
}

// --- Destinations (matched by slug; incl. mustSee/mustDo/mustEat) ----------
type MustRow = { title: string; description: string }
const DESTINATIONS: Record<
  string,
  {
    name: string
    summary: string
    description: string
    must: Record<string, MustRow>
  }
> = {
  'ninh-binh': {
    name: 'Ninh Bình',
    summary:
      'Núi đá vôi, ruộng lúa và những chuyến thuyền qua hang động — thường được gọi là "Vịnh Hạ Long trên cạn".',
    description:
      'Các dòng nước Tràng An và Tam Cốc của Ninh Bình uốn lượn giữa những đỉnh núi đá vôi sừng sững, khám phá tuyệt nhất bằng thuyền chèo truyền thống.',
    must: {
      'Trang An Landscape Complex': {
        title: 'Quần thể danh thắng Tràng An',
        description: 'Di sản Thế giới UNESCO với các đỉnh núi đá vôi và hang động.',
      },
      "Row a sampan through Trang An's caves": {
        title: 'Chèo thuyền nan qua các hang động Tràng An',
        description: 'Người chèo thuyền địa phương luồn lách qua những lối hang thấp bằng tay.',
      },
      'Climb Mua Cave viewpoint': {
        title: 'Leo lên đỉnh ngắm cảnh Hang Múa',
        description: 'Khoảng 500 bậc thang lên tầm nhìn toàn cảnh những cánh đồng lúa bên dưới.',
      },
      'Com Chay (goat rice)': {
        title: 'Cơm cháy (dê núi)',
        description: 'Món đặc sản của Ninh Bình, ăn kèm cơm nếp.',
      },
    },
  },
  'hoi-an': {
    name: 'Hội An',
    summary: 'Thương cảng cổ được UNESCO công nhận, nổi tiếng với những đêm đèn lồng và nghề may đo.',
    description:
      'Phố Cổ Hội An vẫn giữ nguyên nét thương cảng thế kỷ 15-19, trải nghiệm tuyệt nhất là đi bộ sau hoàng hôn khi đèn lồng thắp sáng bờ sông.',
    must: {
      'Japanese Covered Bridge': {
        title: 'Chùa Cầu Nhật Bản',
        description: 'Cây cầu thế kỷ 16 nối khu phố người Nhật và người Hoa.',
      },
      'Get a custom outfit tailored': {
        title: 'May một bộ trang phục theo yêu cầu',
        description: 'May đo lấy trong ngày là đặc sản của Hội An.',
      },
      'Release a lantern on the Thu Bon River': {
        title: 'Thả đèn hoa đăng trên sông Thu Bồn',
        description: 'Một nghi thức mỗi đêm, đẹp nhất khi thực hiện lúc chạng vạng.',
      },
      'Cao Lau': {
        title: 'Cao Lầu',
        description: 'Món mì độc đáo của Hội An, làm từ nước một giếng cổ đặc biệt của địa phương.',
      },
    },
  },
  hanoi: {
    name: 'Hà Nội',
    summary:
      'Thủ đô của Việt Nam — mê cung phố phường Phố Cổ, kiến trúc thuộc địa Pháp và ẩm thực đường phố huyền thoại.',
    description:
      'Hà Nội thưởng cho những ai chịu khó dạo bước: đền chùa ẩn mình, quán cà phê trứng và những con phố nghề hàng thế kỷ nằm ở mọi góc Phố Cổ.',
    must: {
      'Hoan Kiem Lake': {
        title: 'Hồ Hoàn Kiếm',
        description: 'Trái tim lịch sử của Hà Nội, bao quanh bởi truyền thuyết và những buổi tập thái cực quyền buổi sáng.',
      },
      'Temple of Literature': {
        title: 'Văn Miếu',
        description: 'Trường đại học quốc gia đầu tiên của Việt Nam, có từ năm 1070.',
      },
      'Walk the 36 Streets': {
        title: 'Dạo bước 36 Phố Phường',
        description: 'Mỗi con phố xưa chuyên một nghề — lụa, bạc, thiếc.',
      },
      'Bun Cha': {
        title: 'Bún Chả',
        description: 'Thịt lợn nướng ăn với bún, nổi tiếng nhờ Anthony Bourdain và Obama.',
      },
      'Egg Coffee': {
        title: 'Cà Phê Trứng',
        description: 'Lớp kem lòng đỏ trứng đánh bông phủ trên cà phê Việt đậm đặc.',
      },
    },
  },
}

function translateMustArray(rows: unknown, dict: Record<string, MustRow>): Dict[] {
  if (!Array.isArray(rows)) return []
  return (rows as Dict[]).map((row) => {
    const t = dict[String(row.title)]
    return t ? { ...row, title: t.title, description: t.description } : row
  })
}

async function translateDestinations(payload: Payload) {
  let n = 0
  for (const [slug, t] of Object.entries(DESTINATIONS)) {
    const doc = await findOne(payload, 'destinations', { slug: { equals: slug } })
    if (!doc) continue
    await updateVi(payload, 'destinations', doc.id, {
      name: t.name,
      summary: t.summary,
      description: richText(t.description),
      mustSee: translateMustArray(doc.mustSee, t.must),
      mustDo: translateMustArray(doc.mustDo, t.must),
      mustEat: translateMustArray(doc.mustEat, t.must),
    })
    n++
  }
  console.log(`destinations translated (${n})`)
}

// --- FAQs (matched by order) ----------------------------------------------
const FAQS: Record<number, { question: string; answer: string }> = {
  1: {
    question: 'Làm thế nào để đặt tour?',
    answer:
      'Duyệt trang Tour, chọn một tour phù hợp với ngày đi của bạn, và liên hệ qua biểu mẫu phản hồi hoặc liên hệ để hỏi tình trạng chỗ.',
  },
  2: {
    question: 'Hướng dẫn viên của bạn có giấy phép không?',
    answer:
      'Có — mỗi hồ sơ hướng dẫn viên trên trang này đều hiển thị số giấy phép hướng dẫn viên chính thức, loại giấy phép và cơ quan cấp.',
  },
  3: {
    question: 'Tôi có thể để lại phản hồi sau chuyến tour không?',
    answer:
      'Có, hãy dùng trang Phản hồi để gửi đánh giá. Các bài gửi sẽ được kiểm duyệt trước khi hiển thị công khai.',
  },
  4: {
    question: 'Linh Nguyễn nói được những ngôn ngữ nào?',
    answer: 'Linh Nguyễn hướng dẫn bằng tiếng Anh, tiếng Việt và tiếng Pháp.',
  },
  5: {
    question: 'Thời điểm nào trong năm là đẹp nhất để đến Ninh Bình?',
    answer:
      'Từ tháng 10 đến tháng 12 có những cánh đồng lúa vàng óng và thời tiết mát mẻ, lý tưởng cho những chuyến thuyền qua Tràng An.',
  },
}

async function translateFaqs(payload: Payload) {
  let n = 0
  for (const [order, t] of Object.entries(FAQS)) {
    const doc = await findOne(payload, 'faqs', { order: { equals: Number(order) } })
    if (!doc) continue
    await updateVi(payload, 'faqs', doc.id, {
      question: t.question,
      answer: richText(t.answer),
    })
    n++
  }
  console.log(`faqs translated (${n})`)
}

async function main() {
  const payload = await getPayload({ config })
  console.log('[translate:vi] start')
  await translateNav(payload)
  await translateSiteSettings(payload)
  await translateSlides(payload)
  await translateTourTypes(payload)
  await translateTours(payload)
  await translateStories(payload)
  await translatePosts(payload)
  await translateDestinations(payload)
  await translateFaqs(payload)
  console.log('[translate:vi] ✅ done')
  process.exit(0)
}

main().catch((err) => {
  console.error('[translate:vi] failed:', err)
  process.exit(1)
})
